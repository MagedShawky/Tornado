// File: server.js
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sem',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to MySQL database successfully!');
    connection.release();
  } catch (error) {
    console.error('Failed to connect to the database:', error);
  }
})();

// API endpoint for dynamic queries
app.post('/api/query', async (req, res) => {
  try {
    const { query, params } = req.body;
    console.log('Executing query:', query);
    console.log('With parameters:', params);
    
    const [rows] = await pool.query(query, params || []);
    console.log('Query result:', rows);
    
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    console.error('SQL Message:', error.sqlMessage);
    console.error('SQL State:', error.sqlState);
    
    res.status(500).json({ 
      error: error.message,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
  }
});

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API endpoint available at http://localhost:${PORT}/api/query`);
});