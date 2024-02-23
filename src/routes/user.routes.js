import express from 'express';
import { get, list } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/get/:id', get);
router.get('/list', list);

export default router;
