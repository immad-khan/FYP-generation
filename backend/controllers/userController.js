const pool = require('../config/database');

const userController = {

  getAllUsers: async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM users');
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  getUserById: async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.params.id]);
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  createUser: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, password, role]
      );
      res.json({ success: true, userId: result.insertId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  updateUser: async (req, res) => {
    try {
      const { name, email, role } = req.body;
      const [result] = await pool.execute(
        'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
        [name, email, role, req.params.id]
      );
      res.json({ success: true, affectedRows: result.affectedRows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  updateProfilePicture: async (req, res) => {
    try {
      const { profile_picture } = req.body;
      const [result] = await pool.execute(
        'UPDATE users SET profile_picture = ? WHERE id = ?',
        [profile_picture, req.params.id]
      );
      res.json({ success: true, message: 'Profile picture updated' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },


  deleteUser: async (req, res) => {
    try {
      const [result] = await pool.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
      res.json({ success: true, affectedRows: result.affectedRows });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = userController;