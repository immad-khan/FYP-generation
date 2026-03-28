const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const userController = require('./controllers/userController');
const ideaController = require('./controllers/ideaController');
const studentController = require('./controllers/studentController');
const studentProjectController = require('./controllers/studentProjectController');
const authController = require('./controllers/authController');
const { addStudent } = require('./controllers/facultyController');
const WebSocketServer = require('./websocket');

const app = express();
const server = require('http').createServer(app);
const wss = new WebSocketServer(server);

const PORT = process.env.PORT || 5000;
const SALT_ROUNDS = 10;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fyp_generator',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

pool.getConnection()
  .then(connection => {
    console.log('Connected to MySQL database');
    connection.release();
  })
  .catch(err => {
    console.error('Database connection failed:', err);
  });


app.set('db', pool);

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FYP Generator API is running' });
});


app.post('/api/login', authController.login);
app.post('/api/register', authController.register);


app.get('/api/users', authenticateToken, userController.getAllUsers);
app.get('/api/users/:id', authenticateToken, userController.getUserById);
app.put('/api/users/:id/profile-picture', authenticateToken, userController.updateProfilePicture);


app.get('/api/students/:userId/profile', authenticateToken, studentController.getProfile);
app.put('/api/students/:userId/profile', authenticateToken, studentController.updateProfile);
app.get('/api/students', authenticateToken, studentController.getAllStudents);


app.post('/api/students/:userId/ideas/generate', authenticateToken, ideaController.generateIdeas);
app.get('/api/students/:userId/ideas/saved', authenticateToken, ideaController.getSavedIdeas);
app.post('/api/students/:userId/ideas/save', authenticateToken, ideaController.saveIdea);
app.get('/api/students/:userId/courses', authenticateToken, ideaController.getSemesterCourses);

// Student project history endpoints
app.get('/api/students/:userId/projects', authenticateToken, studentProjectController.getStudentProjects);
app.post('/api/students/:userId/projects', authenticateToken, studentProjectController.addSemesterProject);
app.delete('/api/students/projects/:projectId', authenticateToken, studentProjectController.deleteProject);
app.get('/api/students/:userId/profile-completion', authenticateToken, studentProjectController.checkProfileCompletion);
app.post('/api/students/:userId/ideas/generate-with-history', authenticateToken, studentProjectController.generateIdeasWithGroq);

app.get('/api/faculty/ideas/saved', authenticateToken, ideaController.getAllSavedIdeas);
app.put('/api/faculty/ideas/saved/:id/status', authenticateToken, ideaController.updateSavedIdeaStatus);
app.delete('/api/ideas/saved/:id', authenticateToken, ideaController.deleteSavedIdea);

app.post('/api/faculty/insert-student-record', authenticateToken, addStudent);

app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Start Server ---
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
