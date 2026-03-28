/**
 * Migration: Add project_type and semester_course_id columns to saved_ideas
 * Run with: node migrations/001_add_project_type_columns.js
 */

const pool = require('../config/database');

async function runMigration() {
  try {
    console.log('🔄 Running migration: Add project_type and semester_course_id columns...');

    // Add project_type column
    console.log('📝 Adding project_type column...');
    await pool.execute(
      `ALTER TABLE saved_ideas 
       ADD COLUMN IF NOT EXISTS project_type ENUM('FYP', 'Semester') DEFAULT 'FYP'`
    );
    console.log('✅ project_type column added');

    // Add semester_course_id column
    console.log('📝 Adding semester_course_id column...');
    await pool.execute(
      `ALTER TABLE saved_ideas 
       ADD COLUMN IF NOT EXISTS semester_course_id INT(11)`
    );
    console.log('✅ semester_course_id column added');

    // Add foreign key constraint (if it doesn't exist)
    console.log('📝 Adding foreign key constraint...');
    try {
      await pool.execute(
        `ALTER TABLE saved_ideas 
         ADD CONSTRAINT fk_semester_course_id 
         FOREIGN KEY (semester_course_id) REFERENCES semester_records(id) ON DELETE SET NULL`
      );
      console.log('✅ Foreign key constraint added');
    } catch (err) {
      if (err.code === 'ER_DUP_KEYNAME') {
        console.log('⚠️  Foreign key already exists, skipping...');
      } else {
        throw err;
      }
    }

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();
