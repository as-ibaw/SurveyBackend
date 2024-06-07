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

import { checkJwt } from '../utils/checkJwt.js';

const router = express.Router();

router.get('/statistics', checkJwt, listStats);
router.get('/:id', checkJwt, get);
router.get('/:id/public', getPublic);
router.get('/', checkJwt, list);

router.post(
  '/',
  checkJwt,
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
  checkJwt,
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

router.delete('/:id', checkJwt, remove);

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

router.get('/:id/result', checkJwt, getResult);

export default router;
