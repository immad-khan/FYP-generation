const axios = require('axios');
const pool = require('../config/database');

const ideaController = {
  // Generate ideas based on student profile
  generateIdeas: async (req, res) => {
    try {
      console.log('Generating ideas for user:', req.params.userId);
      const { department, semester, cgpa, interests } = req.body;
      const userId = req.params.userId || req.user.id;
      
      console.log('Parameters:', { department, semester, cgpa, interests, userId });
      
      const mockIdeas = [
        {
          title: "AI-Based Academic Performance Predictor",
          description: "Develop a machine learning model to predict student academic performance based on historical data and engagement metrics.",
          tags: ["AI", "Machine Learning", "Education"],
          department: department,
          difficulty: cgpa > 3.5 ? "Advanced" : "Intermediate"
        },
        {
          title: "Smart Attendance System using Facial Recognition",
          description: "Create an automated attendance system using facial recognition technology with real-time reporting.",
          tags: ["Computer Vision", "IoT", "Security"],
          department: department,
          difficulty: "Intermediate"
        },
        {
          title: "E-Commerce Recommendation Engine",
          description: "Build a personalized product recommendation system using collaborative filtering and content-based filtering.",
          tags: ["Data Science", "Web Development", "AI"],
          department: department,
          difficulty: "Beginner"
        }
      ];
      

      const filteredIdeas = mockIdeas.filter(idea => {
        if (!interests) return true;
        const search = interests.toLowerCase();
        return idea.tags.some(tag => 
          search.includes(tag.toLowerCase()) ||
          tag.toLowerCase().includes(search)
        ) || idea.title.toLowerCase().includes(search);
      });
      
      const ideasToShow = filteredIdeas.length > 0 ? filteredIdeas : mockIdeas;
      
      const ideasWithIds = [];
      for (const idea of ideasToShow) {
        const [result] = await pool.execute(
          'INSERT INTO ideas (title, description, category, technologies, difficulty) VALUES (?, ?, ?, ?, ?)',
          [idea.title, idea.description, idea.category || department, idea.tags.join(', '), idea.difficulty || 'Intermediate']
        );
        ideasWithIds.push({ ...idea, id: result.insertId });
      }
      
      res.json({ success: true, ideas: ideasWithIds });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSavedIdeas: async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT i.*, si.saved_at, si.id as saved_id, si.project_type,
         COALESCE(si.status, 'Pending') as status,
         sr.course_code, sr.course_name
         FROM saved_ideas si
         JOIN ideas i ON si.idea_id = i.id
         JOIN students s ON si.student_id = s.id
         LEFT JOIN semester_records sr ON si.semester_course_id = sr.id
         WHERE s.user_id = ?
         ORDER BY si.saved_at DESC`,
        [req.params.userId]
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  getSemesterCourses: async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log('🔹 FETCHING SEMESTER COURSES FOR USER:', userId);
      
      const [courses] = await pool.execute(
        `SELECT DISTINCT sr.id, sr.course_code, sr.course_name, sr.semester_number
         FROM semester_records sr
         JOIN students s ON sr.student_id = s.id
         WHERE s.user_id = ?
         ORDER BY sr.semester_number DESC, sr.course_code`,
        [userId]
      );
      
      console.log('✅ FETCHED', courses.length, 'SEMESTER COURSES');
      res.json(courses);
    } catch (error) {
      console.error('❌ GET SEMESTER COURSES ERROR:', error.message);
      res.status(500).json({ error: error.message });
    }
  },


  saveIdea: async (req, res) => {
    try {
      let { id: ideaId, title, description, category, technologies, difficulty } = req.body;
      const projectType = 'FYP';
      const semesterCourseId = null;
      const userId = req.params.userId || req.body.userId;
      
      // Fallback if frontend sends `ideaId` directly
      if (!ideaId && req.body.ideaId) {
        ideaId = req.body.ideaId;
      }
      
      console.log('🔹 SAVE IDEA REQUEST:', { userId, ideaId, projectType, title });
      
      if (!userId || !ideaId) {
        console.log('❌ Missing userId or ideaId');
        return res.status(400).json({ error: 'User ID and Idea ID are required' });
      }

      // Check if this is a newly generated AI idea that needs to be inserted into the ideas table first
      if (typeof ideaId === 'string' && ideaId.startsWith('groq') && title) {
        console.log('AI Idea detected. Saving to ideas table first...');
        let stringTech = technologies;
        if (Array.isArray(technologies)) {
          stringTech = technologies.join(', ');
        }
        
        const [ideaInsert] = await pool.execute(
          'INSERT INTO ideas (title, description, category, technologies, difficulty) VALUES (?, ?, ?, ?, ?)',
          [title, description || '', category || 'AI-Generated', stringTech || '', difficulty || 'Intermediate']
        );
        ideaId = ideaInsert.insertId;
        console.log('New AI idea stored with ID:', ideaId);
      }

      // Get student_id from user_id
      let [students] = await pool.execute('SELECT id FROM students WHERE user_id = ?', [userId]);
      console.log('📚 Student lookup result for user', userId, ':', students);
      if (students.length === 0) {
        console.log('⚠️ Student profile not found for user', userId, '- auto-creating...');
        const [result] = await pool.execute(
          'INSERT INTO students (user_id, department, cgpa) VALUES (?, ?, ?)',
          [userId, 'Unknown', 0.0]
        );
        students = [{ id: result.insertId }];
      }
      const studentId = students[0].id;
      console.log('✅ Found studentId:', studentId);
    
      // Check for duplicate submission based on project type
      console.log('🔍 Checking FYP constraint...');
      const [existingFYP] = await pool.execute(
        `SELECT id FROM saved_ideas 
         WHERE student_id = ? AND project_type = 'FYP' AND status != 'Rejected'`,
        [studentId]
      );
      
      if (existingFYP.length > 0) {
        console.log('❌ Student already submitted FYP project');
        return res.status(400).json({ 
          error: 'You can only submit 1 FYP project. Please wait for your current submission to be reviewed.',
          code: 'FYP_LIMIT_EXCEEDED'
        });
      }
      
      const [existing] = await pool.execute(
        'SELECT * FROM saved_ideas WHERE student_id = ? AND idea_id = ?',
        [studentId, ideaId]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Idea already saved' });
      }
      
      const [insertResult] = await pool.execute(
        `INSERT INTO saved_ideas (student_id, idea_id, project_type, semester_course_id) 
         VALUES (?, ?, ?, ?)`,
        [studentId, ideaId, projectType, semesterCourseId]
      );
      console.log('✅ IDEA SAVED SUCCESSFULLY:', { studentId, ideaId, projectType, semesterCourseId, insertId: insertResult.insertId });
      
      res.json({ success: true, message: 'Idea saved successfully', savedId: insertResult.insertId, projectType });
    } catch (error) {
      console.error('❌ SAVE IDEA ERROR:', error.message, error.stack);
      res.status(500).json({ error: error.message });
    }
  },

  getAllSavedIdeas: async (req, res) => {
    try {
      console.log('🔹 FETCHING ALL SAVED IDEAS FOR TEACHER');
      const { projectType } = req.query; // Optional filter: 'FYP' or 'Semester'
      
      let query = `SELECT i.*, si.saved_at, u.full_name as student_name, u.id as user_id, si.id as saved_id,
                   JOIN users u ON s.user_id = u.id
                   LEFT JOIN semester_records sr ON si.semester_course_id = sr.id`;
      
      let params = [];
      
      if (projectType && ['FYP', 'Semester'].includes(projectType)) {
        query += ` WHERE si.project_type = ?`;
        params.push(projectType);
      }
      
      query += ` ORDER BY si.saved_at DESC`;
      
      const [rows] = await pool.execute(query, params);
      console.log('✅ FETCHED', rows.length, 'SAVED IDEAS');
      res.json(rows);
    } catch (error) {
      console.error('❌ GET ALL SAVED IDEAS ERROR:', error.message, error.stack);
      res.status(500).json({ error: error.message });
    }
  },

  updateSavedIdeaStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      await pool.execute(
        'UPDATE saved_ideas SET status = ? WHERE id = ?',
        [status, id]
      );
      
      res.json({ success: true, message: `Idea ${status} successfully` });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  deleteSavedIdea: async (req, res) => {
    try {
      await pool.execute(
        'DELETE FROM saved_ideas WHERE id = ?',
        [req.params.id]
      );
      res.json({ success: true, message: 'Idea removed from saved list' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  chatAboutIdea: async (req, res) => {
    try {
      const { message, history, ideaContext } = req.body;
      
      const messages = [
        {
          role: 'system',
          content: 'You are an expert FYP advisor.\nYou are discussing the following project idea with a student:\n' + ideaContext + '\nProvide helpful, detailed, and encouraging guidance on how to create, architect, and implement this idea.'
        },
        ...(history || []),
        { role: 'user', content: message }
      ];

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'llama-3.3-70b-versatile',
          messages,
          temperature: 0.7,
          max_tokens: 1000
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const reply = response.data.choices[0].message.content;
      res.json({ reply });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = ideaController;