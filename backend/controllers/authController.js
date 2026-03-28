const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authController = {

  register: async (req, res) => {
    let connection;
    try {
      const { name, email, password, role = 'student' } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ success: false, error: 'All fields are required' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: 'Invalid email format' });
      }

      if (password.length < 6) {
        return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
      }

      connection = await pool.getConnection();
      await connection.beginTransaction();

      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        await connection.rollback();
        return res.status(401).json({ success: false, error: 'Email already registered' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await connection.execute(
        'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, role]
      );

      const userId = result.insertId;

      if (role === 'student') {
        const regNumber = 'STU-' + userId;
        await connection.execute(
          'INSERT INTO students (user_id, reg_number, current_semester) VALUES (?, ?, 1)', 
          [userId, regNumber]
        );
      } else if (role === 'faculty') {
        const facReg = 'FAC-' + userId;
        await connection.execute(
          'INSERT INTO faculty (user_id, faculty_reg) VALUES (?, ?)', 
          [userId, facReg]
        );
      }

      await connection.execute(
        'INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)',
        [userId, 'REGISTER', 'User registered successfully']
      );

      await connection.commit();

      const token = jwt.sign(
        { id: userId, email, role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: { id: userId, name, email, role }
      });

    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Registration error:', error);
      res.status(500).json({ success: false, error: 'Server error: ' + error.message });
    } finally {
      if (connection) connection.release();
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login attempt:', email);

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);

      if (users.length === 0) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const user = users[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      const userResponse = {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role
      };

      try {
        const table = user.role === 'student' ? 'students' : 'faculty';
        const [profile] = await pool.execute('SELECT * FROM ' + table + ' WHERE user_id = ?', [user.id]);
        if (profile.length > 0) userResponse.profile = profile[0];
      } catch (err) {
        console.warn('Profile fetch failed');
      }

      res.json({ success: true, token, user: userResponse });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ success: false, error: 'Server error during login' });
    }
  },

  verifyToken: async (req, res) => {
    try {
      const [users] = await pool.execute('SELECT id, full_name as name, email, role FROM users WHERE id = ?', [req.user.id]);
      if (users.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json({ success: true, user: users[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = authController;
