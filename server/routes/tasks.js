const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getDashboard,
} = require('../controllers/taskController');

const router = express.Router();

// All routes require auth
router.use(auth);

// Dashboard must come before /:id to avoid "dashboard" being treated as an ID
router.get('/dashboard', getDashboard);

router.get('/', getTasks);

router.post(
  '/',
  [
    body('title').trim().notEmpty().withMessage('Task title is required'),
    body('project').notEmpty().withMessage('Project is required'),
  ],
  createTask
);

router.get('/:id', getTask);

router.put('/:id', updateTask);

router.delete('/:id', deleteTask);

module.exports = router;
