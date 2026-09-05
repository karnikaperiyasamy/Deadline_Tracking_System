import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticateJWT } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  batchCreateTasksSchema,
} from '../validators/task.validator';

const router = Router();

router.use(authenticateJWT);

router.post('/', validateRequest(createTaskSchema), TaskController.createTask);
router.post('/batch', validateRequest(batchCreateTasksSchema), TaskController.batchCreateTasks);
router.get('/', TaskController.getTasks);
router.get('/:id', TaskController.getTaskById);
router.put('/:id', validateRequest(updateTaskSchema), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);
router.patch('/:id/status', validateRequest(updateTaskStatusSchema), TaskController.updateTaskStatus);
router.patch('/:id/complete', TaskController.markTaskComplete);

export default router;
