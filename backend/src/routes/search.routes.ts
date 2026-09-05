import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', SearchController.search);

export default router;
