const pool = require('../config/database');

const addStudent = async(req , res) =>{
    try{
        const { name, regNum, projectId, interest,department, cgpa} = req.body;

        if (!name || !regNum || !department || !cgpa) {
            return res.status(400).json({ error: "Missing required fields" });
          }
        const created_by  = req.user.id;
        const [result] = await pool.execute(
            `INSERT INTO student_record
             ( name, reg_num, project_id, interest, department, cgpa, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              name,
              regNum,
              projectId ? projectId : null,
              interest,
              department,
              cgpa,
              created_by
            ]
          );

          return res.status(201).json({
            success: true, data: result
          });
    }catch(error){
      res.status(500).json({ error: error.message });
    }
};
module.exports = {addStudent};