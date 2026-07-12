import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import createEmployee from './api/create-employee.js';
import updateEmployee from './api/update-employee.js';

// Load environment variables from .env
config();

const app = express();
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[Express] ${req.method} ${req.url}`);
  next();
});

// Mock Vercel serverless request/response wrapper
const runVercelFunction = (handler) => async (req, res) => {
  try {
    await handler(req, res);
  } catch (error) {
    console.error('Local server error:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Local server encountered an error' });
    }
  }
};

app.post('/api/create-employee', runVercelFunction(createEmployee));
app.options('/api/create-employee', runVercelFunction(createEmployee));

app.post('/api/update-employee', runVercelFunction(updateEmployee));
app.options('/api/update-employee', runVercelFunction(updateEmployee));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Local API Server running at http://localhost:${PORT}`);
});
