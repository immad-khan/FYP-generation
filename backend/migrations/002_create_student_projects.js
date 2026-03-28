/**
 * Migration: Create student_projects table to store semester projects history
 * Run with: node migrations/002_create_student_projects.js
 */

const pool = require('../config/database');

async function runMigration() {
  try {
    console.log('🔄 Running migration: Create student_projects table...');

    console.log('📝 Creating student_projects table...');
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS student_projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        semester_number INT NOT NULL,
        course_code VARCHAR(20) NOT NULL,
        course_name VARCHAR(255) NOT NULL,
        project_name VARCHAR(255) NOT NULL,
        project_description LONGTEXT NOT NULL,
        technologies VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        UNIQUE KEY unique_course_project (student_id, semester_number, course_code)
      )`
    );
    console.log('✅ student_projects table created');

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
