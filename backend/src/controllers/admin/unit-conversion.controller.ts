import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Tüm birim dönüşümlerini listele
export const getAllConversions = async (req: Request, res: Response) => {
  try {
    const conversions = await prisma.unitConversion.findMany({
      orderBy: [
        { unitFrom: 'asc' },
        { unitTo: 'asc' }
      ]
    });

    return res.json({
      success: true,
      data: conversions
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Yeni birim dönüşümü ekle
export const createConversion = async (req: Request, res: Response) => {
  try {
    const { unitFrom, unitTo, multiplier } = req.body;

    if (!unitFrom || !unitTo || !multiplier) {
      return res.status(400).json({
        success: false,
        message: 'unitFrom, unitTo ve multiplier gerekli'
      });
    }

    // Aynı dönüşüm var mı kontrol et
    const existing = await prisma.unitConversion.findFirst({
      where: {
        unitFrom,
        unitTo
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Bu dönüşüm zaten mevcut'
      });
    }

    const conversion = await prisma.unitConversion.create({
      data: {
        unitFrom,
        unitTo,
        multiplier: parseFloat(multiplier)
      }
    });

    return res.json({
      success: true,
      data: conversion
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Birim dönüşümünü güncelle
export const updateConversion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { unitFrom, unitTo, multiplier } = req.body;

    const conversion = await prisma.unitConversion.update({
      where: { id: parseInt(id) },
      data: {
        unitFrom,
        unitTo,
        multiplier: parseFloat(multiplier)
      }
    });

    return res.json({
      success: true,
      data: conversion
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Birim dönüşümünü sil
export const deleteConversion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.unitConversion.delete({
      where: { id: parseInt(id) }
    });

    return res.json({
      success: true,
      message: 'Dönüşüm silindi'
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
