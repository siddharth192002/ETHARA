const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const { projectAdmin } = require('../middleware/roleCheck');
const {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/projectController');

const router = express.Router();

// All routes require auth
router.use(auth);

router.get('/', getProjects);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  createProject
);

router.get('/:id', getProject);

router.put('/:id', projectAdmin, updateProject);

router.delete('/:id', projectAdmin, deleteProject);

router.post('/:id/members', projectAdmin, addMember);

router.delete('/:id/members/:userId', projectAdmin, removeMember);

module.exports = router;
