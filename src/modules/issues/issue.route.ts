import { Router } from 'express';
import { createIssue, getAllIssues, getSingleIssue, updateIssue, deleteIssue } from './issue.controller.js';
import { protect, restrictTo } from '../../middleware/auth.middleware.js';

const router = Router();

router.post('/', protect, createIssue);
router.get('/', getAllIssues);
router.get('/:id', getSingleIssue);
router.patch('/:id', protect, updateIssue);
router.delete('/:id', protect, restrictTo('maintainer'), deleteIssue);

export const IssueRoutes = router;