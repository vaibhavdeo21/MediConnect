const pool = require('../db');
const fs = require('fs');
const path = require('path');

// --- 1. UPLOAD DOCUMENT ---
const uploadDocument = async (req, res) => {
  try {
    const { appointmentId, remarks } = req.body; // <--- Added remarks support
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    const newRecord = await pool.query(
      "INSERT INTO medical_records (appointment_id, file_name, file_path, remarks) VALUES ($1, $2, $3, $4) RETURNING *",
      [appointmentId, file.originalname, file.path, remarks || '']
    );

    res.json(newRecord.rows[0]);
  } catch (err) {
    console.error("Upload Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// --- 2. GET DOCUMENTS ---
const getDocuments = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const documents = await pool.query(
      "SELECT * FROM medical_records WHERE appointment_id = $1 ORDER BY uploaded_at DESC",
      [appointmentId]
    );
    res.json(documents.rows);
  } catch (err) {
    console.error("Fetch Docs Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// --- 3. DELETE DOCUMENT ---
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // A. Find file info first (to get path)
    const file = await pool.query("SELECT * FROM medical_records WHERE id = $1", [id]);
    
    if (file.rows.length === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    const filePath = file.rows[0].file_path;

    // B. Delete from Database
    await pool.query("DELETE FROM medical_records WHERE id = $1", [id]);

    // C. Delete from 'uploads' folder
    // Check if file exists before trying to delete
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ message: "File Deleted" });

  } catch (err) {
    console.error("Delete Error:", err.message);
    res.status(500).send("Server Error");
  }
};

// --- 4. UPDATE REMARKS ---
const updateRemarks = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    await pool.query(
      "UPDATE medical_records SET remarks = $1 WHERE id = $2",
      [remarks, id]
    );

    res.json({ message: "Remarks Updated" });

  } catch (err) {
    console.error("Update Remarks Error:", err.message);
    res.status(500).send("Server Error");
  }
};

module.exports = { uploadDocument, getDocuments, deleteDocument, updateRemarks };