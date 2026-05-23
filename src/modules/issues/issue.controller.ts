import { type Request, type Response, type NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IssueService } from './issue.service.js';
import { AppError } from '../../utils/appError.js';

export const createIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description, type } = req.body;
    const user = (req as any).user;
    const reporter_id = user.id;

    if (!title || title.length > 150) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Title is required and must be under 150 characters');
    }
    if (!description || description.length < 20) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Description is required and must be minimum 20 characters');
    }
    if (type !== 'bug' && type !== 'feature_request') {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Type must be bug or feature_request');
    }

    const issue = await IssueService.create({ title, description, type, reporter_id });

    res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Issue created successfully',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const getAllIssues = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sort, type, status } = req.query;
    const issues = await IssueService.getAll({
      sort: sort as string,
      type: type as string,
      status: status as string
    });

    res.status(StatusCodes.OK).json({
      success: true,
      data: issues
    });
  } catch (error) {
    next(error);
  }
};

export const getSingleIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid issue ID format');

    const issue = await IssueService.getById(id);
    if (!issue) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Requested resource does not exist');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      data: issue
    });
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const { title, description, type, status } = req.body;
    const user = (req as any).user;

    const issue = await IssueService.findRawIssue(id);
    if (!issue) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Requested resource does not exist');
    }

    if (user.role === 'contributor') {
      if (issue.reporter_id !== user.id) {
        throw new AppError(StatusCodes.FORBIDDEN, 'Valid token but insufficient role/permissions');
      }
      if (issue.status !== 'open') {
        throw new AppError(StatusCodes.CONFLICT, 'Business logic conflict: Can only edit open issues');
      }
      if (status) {
        throw new AppError(StatusCodes.FORBIDDEN, 'Contributors are unauthorized to update issue workflow states');
      }
    }

    const fieldsToUpdate: any = {};
    if (title !== undefined) fieldsToUpdate.title = title;
    if (description !== undefined) fieldsToUpdate.description = description;
    if (type !== undefined) fieldsToUpdate.type = type;
    if (status !== undefined && user.role === 'maintainer') fieldsToUpdate.status = status;

    const updatedIssue = await IssueService.update(id, fieldsToUpdate);

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id as string);
    const wasDeleted = await IssueService.delete(id);

    if (!wasDeleted) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Requested resource does not exist');
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};