import express from 'express';
import { list, setRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.get('/list', list);

router.patch('/:id/read', setRead);

export default router;
