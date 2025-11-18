import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { userService } from '../services/user.service';

export const profileController = {
  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      const profile = await userService.getProfile(userId);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 3001,
          message: error.message || 'Failed to get profile',
        },
      });
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;
      const { name, phone, bio } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      const profile = await userService.updateProfile(userId, { name, phone, bio });

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 2001,
          message: error.message || 'Failed to update profile',
        },
      });
    }
  },

  async uploadProfileImage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: { code: 2001, message: 'No file uploaded' },
        });
      }

      const imagePath = `/uploads/profiles/${req.file.filename}`;
      const profile = await userService.updateProfileImage(userId, imagePath);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to upload image',
        },
      });
    }
  },

  async deleteProfileImage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: { code: 1004, message: 'Unauthorized' },
        });
      }

      const profile = await userService.deleteProfileImage(userId);

      return res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        error: {
          code: 5000,
          message: error.message || 'Failed to delete image',
        },
      });
    }
  },
};
