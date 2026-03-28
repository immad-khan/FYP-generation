const pool = require('../config/database');

async function runMigration() {
  try {
    console.log('Running migration: Update student_projects table...');

    // add columns
    try {
        await pool.execute('ALTER TABLE student_projects ADD COLUMN languages VARCHAR(255) DEFAULT "" AFTER project_description');
        await pool.execute('ALTER TABLE student_projects ADD COLUMN frontend_frameworks VARCHAR(255) DEFAULT "" AFTER languages');
        await pool.execute('ALTER TABLE student_projects ADD COLUMN backend_frameworks VARCHAR(255) DEFAULT "" AFTER frontend_frameworks');
    } catch (e) { console.log('Columns may already exist', e.message); }
    
    // drop old column if exists
    try {
        await pool.execute('ALTER TABLE student_projects DROP COLUMN technologies');
    } catch (e) { console.log('technologies column may not exist', e.message); }

    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();