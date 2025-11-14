import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UpdateSettingsDto {
  allowRegistration?: boolean;
  maintenanceMode?: boolean;
  maxFileUploadSize?: number;
  sessionTimeout?: number;
}

const settingsService = {
  async getSettings() {
    try {
      // @ts-ignore - Prisma client will be regenerated
      let settings = await prisma.systemSettings.findFirst();

      if (!settings) {
        // @ts-ignore - Prisma client will be regenerated
        settings = await prisma.systemSettings.create({
          data: {
            allowRegistration: true,
            maintenanceMode: false,
            maxFileUploadSize: 5242880,
            sessionTimeout: 86400,
          },
        });
      }

      return settings;
    } catch (error) {
      console.error('Get settings error:', error);
      throw error;
    }
  },

  async updateSettings(data: UpdateSettingsDto, updatedBy: number) {
    try {
      // @ts-ignore - Prisma client will be regenerated
      const settings = await prisma.systemSettings.findFirst();

      if (!settings) {
        // @ts-ignore - Prisma client will be regenerated
        return await prisma.systemSettings.create({
          data: {
            ...data,
            updatedBy,
          },
        });
      }

      // @ts-ignore - Prisma client will be regenerated
      return await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          ...data,
          updatedBy,
        },
      });
    } catch (error) {
      console.error('Update settings error:', error);
      throw error;
    }
  },

  async toggleMaintenanceMode(enabled: boolean, updatedBy: number) {
    try {
      const settings = await this.getSettings();

      // @ts-ignore - Prisma client will be regenerated
      return await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          maintenanceMode: enabled,
          updatedBy,
        },
      });
    } catch (error) {
      console.error('Toggle maintenance mode error:', error);
      throw error;
    }
  },

  async isMaintenanceModeActive(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.maintenanceMode;
    } catch (error) {
      console.error('Check maintenance mode error:', error);
      return false;
    }
  },

  async isRegistrationAllowed(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.allowRegistration;
    } catch (error) {
      console.error('Check registration allowed error:', error);
      return true;
    }
  },
};


export { settingsService };
