const pool = require('../config/database');

const studentController = {
  // Get student profile
  getProfile: async (req, res) => {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM students WHERE user_id = ?',
        [req.params.userId]
      );
      
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        // Create student entry if it doesn't exist (safety)
        const regNumber = `STU-${req.params.userId}`;
        const [result] = await pool.execute(
          'INSERT INTO students (user_id, reg_number, current_semester) VALUES (?, ?, ?)',
          [req.params.userId, regNumber, 1]
        );
        res.json({ id: result.insertId, user_id: req.params.userId, reg_number: regNumber, current_semester: 1 });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update student profile
  updateProfile: async (req, res) => {
    try {
      const { department, cgpa, current_semester, area_of_interest, major, reg_number } = req.body;
      
      const [result] = await pool.execute(
        `UPDATE students 
         SET department = ?, cgpa = ?, current_semester = ?, area_of_interest = ?, major = ?, reg_number = ?
         WHERE user_id = ?`,
        [department, cgpa, current_semester, area_of_interest, major, reg_number, req.params.userId]
      );
      
      if (result.affectedRows === 0) {
        await pool.execute(
          'INSERT INTO students (user_id, department, cgpa, current_semester, area_of_interest, major, reg_number) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [req.params.userId, department, cgpa, current_semester, area_of_interest, major, reg_number]
        );
      }
      
      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get all students (for faculty)
  getAllStudents: async (req, res) => {
    try {
      const [rows] = await pool.execute(
        `SELECT u.id, u.full_name as name, u.email, u.role, 
                s.department, s.cgpa, s.current_semester as semester, s.area_of_interest, s.reg_number
         FROM users u
         LEFT JOIN students s ON u.id = s.user_id
         WHERE u.role = 'student'`
      );
      res.json(rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = studentController;