import { Request, Response } from 'express';
import { unitConversionService } from '../services/unit-conversion.service';

// Birim dönüşümü yap
export const convertUnit = async (req: Request, res: Response) => {
  try {
    const { quantity, fromUnit, toUnit, ingredientName } = req.body;

    if (!quantity || !fromUnit || !toUnit) {
      return res.status(400).json({
        success: false,
        message: 'Miktar, kaynak birim ve hedef birim gerekli'
      });
    }

    const result = await unitConversionService.convert(
      parseFloat(quantity),
      fromUnit,
      toUnit,
      ingredientName
    );

    if (result) {
      // Virgülden sonra 1 hane yuvarlama
      result.quantity = Math.round(result.quantity * 10) / 10;
      
      return res.json({
        success: true,
        data: result
      });
    } else {
      return res.json({
        success: false,
        message: 'Birim dönüşümü yapılamadı',
        data: { quantity: parseFloat(quantity), unit: fromUnit }
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Toplu birim dönüşümü (tarif malzemeleri için)
export const convertBatch = async (req: Request, res: Response) => {
  try {
    const { items } = req.body; // [{ name, quantity, unit, targetUnit }]

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'items array gerekli'
      });
    }

    const results = [];

    for (const item of items) {
      const result = await unitConversionService.convert(
        parseFloat(item.quantity),
        item.unit,
        item.targetUnit,
        item.name
      );

      results.push({
        name: item.name,
        original: { quantity: parseFloat(item.quantity), unit: item.unit },
        converted: result || { quantity: parseFloat(item.quantity), unit: item.unit }
      });
    }

    return res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
