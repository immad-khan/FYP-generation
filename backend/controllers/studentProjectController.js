const pool = require('../config/database');
const axios = require('axios');

const ensureStudentRecord = async (userId) => {
  const [students] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [userId]);
  if (students.length > 0) return students[0].id;

  const [result] = await pool.execute(
    'INSERT INTO students (user_id, department, cgpa) VALUES (?, ?, ?)',
    [userId, 'Unknown', 0.0]
  );
  return result.insertId;
};

const studentProjectController = {
  // Get all projects for a student
  getStudentProjects: async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log('🔹 FETCHING PROJECTS FOR USER:', userId);

      const studentId = await ensureStudentRecord(userId);

      const [projects] = await pool.execute(
        `SELECT sp.*, s.id as student_id
         FROM student_projects sp
         JOIN students s ON sp.student_id = s.id
         WHERE sp.student_id = ?
         ORDER BY sp.semester_number ASC, sp.created_at ASC`,
        [studentId]
      );

      console.log('✅ FETCHED', projects.length, 'PROJECTS');
      res.json({ projects });
    } catch (error) {
      console.error('❌ GET PROJECTS ERROR:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Add a semester project
  addSemesterProject: async (req, res) => {
    try {
      const userId = req.params.userId;
        const { semesterNumber, courseCode, courseName, projectName, projectDescription, languages, frontendFrameworks, backendFrameworks } = req.body;

        console.log('🔹 ADDING PROJECT FOR USER:', userId, { semesterNumber, courseCode, courseName, projectName });

        if (!semesterNumber || !courseName || !projectName) {
          return res.status(400).json({ error: 'Core fields (semesterNumber, courseName, projectName) are required' });
        }

        const studentId = await ensureStudentRecord(userId);

        // Insert or update project
        const [result] = await pool.execute(
          `INSERT INTO student_projects 
           (student_id, semester_number, course_code, course_name, project_name, project_description, languages, frontend_frameworks, backend_frameworks)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
           project_name = VALUES(project_name),
           project_description = VALUES(project_description),
           languages = VALUES(languages),
           frontend_frameworks = VALUES(frontend_frameworks),
           backend_frameworks = VALUES(backend_frameworks),
           updated_at = NOW()`,
          [studentId, semesterNumber, courseCode, courseName, projectName, projectDescription || '', languages || '', frontendFrameworks || '', backendFrameworks || '']
        );
      res.json({ success: true, message: 'Project saved successfully', projectId: result.insertId });
    } catch (error) {
      console.error('❌ ADD PROJECT ERROR:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a project
  deleteProject: async (req, res) => {
    try {
      const { projectId } = req.params;
      console.log('🔹 DELETING PROJECT:', projectId);

      await pool.execute('DELETE FROM student_projects WHERE id = ?', [projectId]);

      console.log('✅ PROJECT DELETED');
      res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error) {
      console.error('❌ DELETE PROJECT ERROR:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Check if student profile is complete (has at least one project per expected semester)
  checkProfileCompletion: async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log('🔹 CHECKING PROFILE COMPLETION FOR USER:', userId);

      const studentId = await ensureStudentRecord(userId);

      // Get student info
      const [studentData] = await pool.execute(
        `SELECT current_semester FROM students WHERE id = ?`,
        [studentId]
      );

      const currentSemester = studentData.length > 0 && studentData[0].current_semester ? studentData[0].current_semester : 1;

      // Get unique semesters with projects
      const [projectSemesters] = await pool.execute(
        `SELECT DISTINCT semester_number FROM student_projects WHERE student_id = ? ORDER BY semester_number`,
        [studentId]
      );

      const completedSemesters = projectSemesters.map(row => row.semester_number);
      // Require at least 6 projects in total
      const [totalProjects] = await pool.execute(
        `SELECT COUNT(*) as count FROM student_projects WHERE student_id = ?`,
        [studentId]
      );
      const totalCount = totalProjects[0].count;
      const isComplete = totalCount >= 6;

      console.log('✅ PROFILE CHECK - Completed semesters:', completedSemesters, 'Total Projects:', totalCount);
      res.json({
        isComplete,
        completedSemesters,
        currentSemester,
        totalProjectCount: totalCount
      });
    } catch (error) {
      console.error('❌ PROFILE CHECK ERROR:', error.message);
      res.status(500).json({ error: error.message });
    }
  },

  // Generate ideas using Groq API based on student projects
  generateIdeasWithGroq: async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log('🔹 GENERATING IDEAS WITH GROQ FOR USER:', userId);

      const studentId = await ensureStudentRecord(userId);

      // Get student info
      const [studentData] = await pool.execute(
        `SELECT s.id, s.area_of_interest, u.full_name
         FROM students s
         JOIN users u ON s.user_id = u.id
         WHERE s.id = ?`,
        [studentId]
      );

      const student = studentData[0];

      // Get all student projects
      const [projects] = await pool.execute(
        `SELECT * FROM student_projects WHERE student_id = ? ORDER BY semester_number ASC`,
        [student.id]
      );

      if (projects.length < 6) {
        return res.status(400).json({
          error: 'At least 6 projects are required to generate ideas. Please add more projects.',      
          code: 'PROFILE_INCOMPLETE'
        });
      }

      // Get saved ideas to exclude them
      const [savedIdeas] = await pool.execute(
        `SELECT title FROM saved_ideas WHERE student_id = ?`,
        [student.id]
      );
      const excludedIdeasTitles = savedIdeas.map(idea => idea.title).join(', ');
      
      const excludedContext = excludedIdeasTitles ? `\nDO NOT suggest any of these previously saved ideas: ${excludedIdeasTitles}\n` : '';

      // Build context from projects
      let projectContext = 'Student Project History:\n\n';
      projects.forEach(proj => {
        projectContext += `Semester ${proj.semester_number}:\n`;
        projectContext += `- Course: ${proj.course_code} - ${proj.course_name}\n`;
        projectContext += `- Project: ${proj.project_name}\n`;
        projectContext += `- Description: ${proj.project_description}\n`;
          projectContext += `- Languages: ${proj.languages}\n`;
          projectContext += `- Frontend: ${proj.frontend_frameworks}\n`;
          projectContext += `- Backend: ${proj.backend_frameworks}\n\n`;
      });

      const interestContext = student.area_of_interest ? `\nStudent's Stated Interests:\n${student.area_of_interest}\n` : '';

      const prompt = `Based on the following student history, suggest 3 highly relevant and innovative Final Year Project (FYP) ideas:

${projectContext}
${interestContext}
${excludedContext}

For each FYP idea, provide:
1. Project Title
2. Detailed Description (2-3 sentences)
3. Key Technologies to use
4. Difficulty Level (Beginner/Intermediate/Advanced)
5. Why it's a good fit for this student (based on their history)

Format each idea clearly and make them progressively more complex. They should leverage the student's existing knowledge and push them slightly beyond their current skill level.`;

      console.log('📝 Sending request to Groq API...');
      
      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'mixtral-8x7b-32768',
          messages: [
            {
              role: 'system',
              content: 'You are an expert FYP advisor. Generate innovative project ideas tailored to the student.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ GROQ API RESPONSE RECEIVED');

      const aiResponse = response.data.choices[0].message.content;

      // Parse AI response into structured ideas
      const ideas = parseGroqResponse(aiResponse, projects);

      res.json({
        success: true,
        ideas,
        context: {
          studentName: student.full_name,
          projectCount: projects.length,
          interests: student.area_of_interest
        }
      });
    } catch (error) {
      console.error('❌ GROQ GENERATION ERROR:', error.response?.data || error.message);
      res.status(500).json({
        error: error.response?.data?.error?.message || error.message,
        details: 'Failed to generate ideas with Groq API'
      });
    }
  }
};

// Helper function to parse Groq response into structured ideas
function parseGroqResponse(content, projects) {
  // Extract technologies used by student
  const allTechs = projects
      .flatMap(p => [
        ...(p.languages ? p.languages.split(',') : []),
        ...(p.frontend_frameworks ? p.frontend_frameworks.split(',') : []),
        ...(p.backend_frameworks ? p.backend_frameworks.split(',') : [])
      ].map(t => t.trim()).filter(Boolean))
  const ideas = [];
  const sections = content.split(/Idea \d+:|Project \d+:|Idea:/i).slice(1);

  sections.forEach((section, index) => {
    const titleMatch = section.match(/(?:Title|Project Title):\s*(.+?)(?:\n|$)/i);
    const descMatch = section.match(/(?:Description|Details?):\s*(.+?)(?:Technologies|Tech|$)/is);
    const techMatch = section.match(/(?:Technologies|Tech|Stack):\s*(.+?)(?:\n|Difficulty|Why|$)/i);
    const diffMatch = section.match(/Difficulty(?:\s+Level)?:\s*(.+?)(?:\n|Why|$)/i);

    if (titleMatch && descMatch) {
      ideas.push({
        id: `groq-${index + 1}`,
        title: titleMatch[1].trim(),
        description: descMatch[1].trim(),
        technologies: techMatch ? techMatch[1].trim() : allTechs.slice(0, 3).join(', '),
        difficulty: diffMatch ? diffMatch[1].trim() : 'Intermediate',
        category: 'AI-Generated',
        source: 'groq'
      });
    }
  });

  // If parsing failed, return fallback
  if (ideas.length === 0) {
    ideas.push({
      id: 'groq-raw',
      title: 'AI-Generated FYP Ideas',
      description: content.substring(0, 500),
      technologies: allTechs.join(', '),
      difficulty: 'Intermediate',
      category: 'AI-Generated',
      source: 'groq'
    });
  }

  return ideas.slice(0, 5); // Return max 5 ideas
}

module.exports = studentProjectController;
