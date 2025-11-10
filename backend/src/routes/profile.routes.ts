import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { profileController } from '../controllers/profile.controller';
import { upload } from '../middleware/upload';

const router = Router();

router.get('/', authMiddleware, profileController.getProfile);
router.put('/update', authMiddleware, profileController.updateProfile);
router.post('/upload-image', authMiddleware, upload.single('image'), profileController.uploadProfileImage);
router.delete('/image', authMiddleware, profileController.deleteProfileImage);

export default router;
