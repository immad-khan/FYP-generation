import axios from 'axios';

class AIService {
  constructor() {
    this.baseURL = process.env.REACT_APP_AI_API_URL || 'http://localhost:5001';
  }

  async generateIdeas(studentProfile) {
    try {

      const { department, semester, cgpa, areaOfInterest } = studentProfile;
      
      const ideaTemplates = [
        {
          title: "AI-Powered {department} Assistant",
          description: "Develop an intelligent assistant system for {department} students using natural language processing and machine learning algorithms.",
          tags: ["AI", "Machine Learning", "NLP"],
          difficulty: cgpa > 3.5 ? "Advanced" : "Intermediate"
        },
        {
          title: "Smart {interest} Analysis Tool",
          description: "Create a web-based tool for analyzing and visualizing {interest} data with predictive capabilities.",
          tags: ["Data Analysis", "Web Development", "{interest}"],
          difficulty: "Intermediate"
        },
        {
          title: "{department} Resource Management System",
          description: "Build a comprehensive system for managing {department} resources, scheduling, and student interactions.",
          tags: ["System Design", "Database", "Web App"],
          difficulty: "Beginner"
        },
        {
          title: "Automated {interest} Detection System",
          description: "Implement a real-time detection system for {interest} applications using computer vision and deep learning.",
          tags: ["Computer Vision", "Deep Learning", "Real-time"],
          difficulty: cgpa > 3.0 ? "Advanced" : "Intermediate"
        }
      ];

      const ideas = ideaTemplates.map(template => ({
        id: Math.random().toString(36).substr(2, 9),
        title: template.title
          .replace('{department}', department)
          .replace('{interest}', areaOfInterest || 'Data'),
        description: template.description
          .replace('{department}', department)
          .replace('{interest}', areaOfInterest || 'data'),
        tags: template.tags.map(tag => 
          tag.replace('{interest}', areaOfInterest || 'Data')
        ),
        difficulty: template.difficulty,
        relevance: this.calculateRelevance(areaOfInterest, template.tags),
        estimatedTime: this.estimateProjectTime(semester, template.difficulty)
      }));

      return ideas.sort((a, b) => b.relevance - a.relevance).slice(0, 5);

    } catch (error) {
      console.error('AI idea generation error:', error);
      throw error;
    }
  }

  calculateRelevance(interest, tags) {
    if (!interest) return 0.5;
    
    const interestWords = interest.toLowerCase().split(/[, ]+/);
    const tagWords = tags.join(' ').toLowerCase();
    
    let matches = 0;
    interestWords.forEach(word => {
      if (tagWords.includes(word)) matches++;
    });
    
    return matches / interestWords.length;
  }

  estimateProjectTime(semester, difficulty) {
    const baseHours = {
      Beginner: 80,
      Intermediate: 120,
      Advanced: 200
    };
    
    const semesterFactor = 1 - ((semester - 1) * 0.05);
    return Math.round(baseHours[difficulty] * semesterFactor);
  }

  // Optional: Real AI integration with OpenAI
  async generateWithOpenAI(prompt) {
    try {
      const response = await axios.post(`${this.baseURL}/generate`, {
        prompt: `Generate a Final Year Project idea for: ${prompt}`,
        max_tokens: 150,
        temperature: 0.7
      });
      
      return response.data.choices[0].text.trim();
    } catch (error) {
      console.error('OpenAI error:', error);
      return null;
    }
  }
}

export default new AIService();