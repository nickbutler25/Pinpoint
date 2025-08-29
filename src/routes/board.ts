import { Router } from 'express';
import { getBoardData } from '../controllers/board-controller';

const router = Router();

// GET /api/boards/:boardId - Fetch board data with columns and items
router.get('/boards/:boardId', getBoardData);

export default router;