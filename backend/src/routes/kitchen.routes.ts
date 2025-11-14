import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { kitchenController } from '../controllers/kitchen.controller';

const router = Router();

router.get('/', authMiddleware, kitchenController.getActiveKitchen);
router.post('/join-request', authMiddleware, kitchenController.requestJoinKitchen);
router.get('/pending-requests', authMiddleware, kitchenController.getPendingRequests);
router.get('/my-join-requests', authMiddleware, kitchenController.getMyJoinRequests);
router.post('/approve-request', authMiddleware, kitchenController.approveJoinRequest);
router.post('/reject-request', authMiddleware, kitchenController.rejectJoinRequest);
router.post('/cancel-request', authMiddleware, kitchenController.cancelJoinRequest);
router.post('/leave', authMiddleware, kitchenController.leaveKitchen);
router.post('/remove-member', authMiddleware, kitchenController.removeMember);

export default router;
