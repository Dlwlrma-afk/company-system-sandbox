const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.post('/api/submissions', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO submissions (message) VALUES ($1) RETURNING id, message, created_at',
      [message.trim()]
    );

    res.status(201).json({
      received: true,
      id: result.rows[0].id,
      message: result.rows[0].message,
      status: 'saved'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to save submission' });
  }
});

app.get('/api/submissions', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, message, created_at FROM submissions ORDER BY created_at DESC LIMIT 50'
    );

    res.status(200).json({
      submissions: result.rows
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
