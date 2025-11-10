import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class ModuleService {
  /**
   * Tüm modülleri listeler
   */
  async getAllModules() {
    return await prisma.module.findMany({
      orderBy: { isCore: 'desc' },
    });
  }

  /**
   * Mutfağın modüllerini getirir
   */
  async getKitchenModules(kitchenId: number) {
    const kitchenModules = await prisma.kitchenModule.findMany({
      where: { kitchenId },
      include: {
        module: true,
      },
    });

    return kitchenModules;
  }

  /**
   * Modül aktif/pasif eder
   */
  async toggleModule(kitchenId: number, moduleId: number) {
    // Modülün core olup olmadığını kontrol et
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
    });

    if (!module) {
      throw new Error('Modül bulunamadı');
    }

    if (module.isCore) {
      throw new Error('Core modüller devre dışı bırakılamaz');
    }

    // Mevcut kaydı kontrol et
    const existing = await prisma.kitchenModule.findFirst({
      where: {
        kitchenId,
        moduleId,
      },
    });

    if (existing) {
      // Varsa toggle et
      return await prisma.kitchenModule.update({
        where: { id: existing.id },
        data: { isEnabled: !existing.isEnabled },
        include: { module: true },
      });
    } else {
      // Yoksa oluştur
      return await prisma.kitchenModule.create({
        data: {
          kitchenId,
          moduleId,
          isEnabled: true,
        },
        include: { module: true },
      });
    }
  }

  /**
   * Mutfak için modül durumlarını getirir
   */
  async getModuleStatus(kitchenId: number) {
    const allModules = await this.getAllModules();
    const kitchenModules = await this.getKitchenModules(kitchenId);

    // Her modül için durum bilgisi oluştur
    return allModules.map((module) => {
      const kitchenModule = kitchenModules.find((km) => km.moduleId === module.id);

      return {
        ...module,
        isEnabled: module.isCore ? true : kitchenModule?.isEnabled || false,
        canToggle: !module.isCore && module.isActive,
      };
    });
  }
}

export const moduleService = new ModuleService();
export default moduleService;
