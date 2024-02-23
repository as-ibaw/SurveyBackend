import express from 'express';
import {
  create,
  get,
  getPublic,
  getResult,
  list,
  listStats,
  remove,
  response,
  update,
} from '../controllers/survey.controller.js';

import { validationResult } from 'express-validator';
import {
  validateSurveyCreate,
  validateSurveyResponse,
  validateSurveyUpdate,
} from '../validations/survey.validations.js';

const router = express.Router();
router.get('/statistics', listStats);

router.get('/:id', get);
router.get('/:id/public', getPublic);
router.get('/', list);

router.post(
  '/',
  validateSurveyCreate,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  create
);

router.put(
  '/:id',
  validateSurveyUpdate,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  update
);

router.delete('/:id', remove);

router.post(
  '/:id/responses',
  validateSurveyResponse,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  response
);

router.get('/:id/result', getResult);

export default router;
