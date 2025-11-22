import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// API key şifreleme
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'cookify-ai-encryption-key-32ch';
const ALGORITHM = 'aes-256-cbc';

const encryptApiKey = (apiKey: string): string => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptApiKey = (encryptedKey: string): string => {
  const parts = encryptedKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.slice(0, 32)), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Kullanıcının AI entegrasyonlarını getir
export const getAIIntegrations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // @ts-ignore - Prisma client cache issue
    const integrations = await prisma.aIIntegration.findMany({
      where: { userId },
      select: {
        id: true,
        provider: true,
        isActive: true,
        model: true,
        settings: true,
        createdAt: true,
        updatedAt: true,
        // API key'i döndürme (güvenlik)
      }
    });

    res.json({ success: true, integrations });
  } catch (error) {
    console.error('AI entegrasyonları getirme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Yeni AI entegrasyonu ekle
export const addAIIntegration = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { provider, apiKey, model, settings } = req.body;

    console.log('🔍 AI Integration Request:', { userId, provider, apiKey: apiKey?.substring(0, 10) + '...', model });

    if (!provider || !apiKey) {
      res.status(400).json({ success: false, message: 'Provider ve API key gerekli' });
      return;
    }

    // API key'i şifrele
    const encryptedKey = encryptApiKey(apiKey);

    // Direkt SQL kullan (Prisma cache sorunu)
    const result: any = await prisma.$queryRaw`
      INSERT INTO ai_integrations ("userId", provider, "apiKey", model, settings, "isActive", "createdAt", "updatedAt")
      VALUES (${userId}, ${provider}, ${encryptedKey}, ${model}, ${settings ? JSON.stringify(settings) : null}, true, NOW(), NOW())
      RETURNING *
    `;

    const integration = Array.isArray(result) ? result[0] : result;

    res.json({ 
      success: true, 
      message: 'AI entegrasyonu eklendi',
      integration: {
        id: integration.id,
        provider: integration.provider,
        model: integration.model,
        isActive: integration.isActive,
      }
    });
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ success: false, message: 'Bu AI sağlayıcısı zaten eklenmiş' });
      return;
    }
    console.error('AI entegrasyonu ekleme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// AI entegrasyonunu güncelle
export const updateAIIntegration = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { apiKey, model, settings, isActive } = req.body;

    // @ts-ignore - Prisma client cache issue
    const integration = await prisma.aIIntegration.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!integration) {
      res.status(404).json({ success: false, message: 'Entegrasyon bulunamadı' });
      return;
    }

    const updateData: any = {};
    if (apiKey) updateData.apiKey = encryptApiKey(apiKey);
    if (model !== undefined) updateData.model = model;
    if (settings !== undefined) updateData.settings = JSON.stringify(settings);
    if (isActive !== undefined) updateData.isActive = isActive;

    // @ts-ignore - Prisma client cache issue
    const updated = await prisma.aIIntegration.update({
      where: { id: parseInt(id) },
      data: updateData
    });

    res.json({ 
      success: true, 
      message: 'AI entegrasyonu güncellendi',
      integration: {
        id: updated.id,
        provider: updated.provider,
        model: updated.model,
        isActive: updated.isActive,
      }
    });
  } catch (error) {
    console.error('AI entegrasyonu güncelleme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// AI entegrasyonunu sil
export const deleteAIIntegration = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    // @ts-ignore - Prisma client cache issue
    const integration = await prisma.aIIntegration.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!integration) {
      res.status(404).json({ success: false, message: 'Entegrasyon bulunamadı' });
      return;
    }

    // @ts-ignore - Prisma client cache issue
    await prisma.aIIntegration.delete({
      where: { id: parseInt(id) }
    });

    res.json({ success: true, message: 'AI entegrasyonu silindi' });
  } catch (error) {
    console.error('AI entegrasyonu silme hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Market fişi okuma (OCR + AI)
export const scanReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const imageFile = (req as any).file;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    if (!imageFile) {
      res.status(400).json({ success: false, message: 'Fiş fotoğrafı gerekli' });
      return;
    }

    // MOCK DATA - Gerçek API key olmadığı için test verisi döndür
    const MOCK_MODE = true; // Şimdilik her zaman mock mode
    
    if (MOCK_MODE) {
      
      // Mock fiş verileri
      const mockIngredients = [
        { name: 'domates', quantity: 2, unit: 'kg' },
        { name: 'patates', quantity: 5, unit: 'kg' },
        { name: 'soğan', quantity: 3, unit: 'adet' },
        { name: 'süt', quantity: 1, unit: 'litre' },
        { name: 'deterjan', quantity: 1, unit: 'adet' }, // Bu eşleşmeyecek
      ];

      // Veritabanında eşleştir
      const matchedIngredients: any[] = [];
      const unmatchedIngredients: string[] = [];

      for (const ingredient of mockIngredients) {
        try {
          const searchResult: any = await prisma.$queryRaw`
            SELECT i.name, i."defaultUnit", i."shelfLifeDays", c.name as "categoryName"
            FROM ingredients i
            JOIN categories c ON i."categoryId" = c.id
            WHERE LOWER(i.name) LIKE LOWER(${'%' + ingredient.name + '%'})
            LIMIT 1
          `;

          if (searchResult && searchResult.length > 0) {
            const dbIngredient = searchResult[0];
            matchedIngredients.push({
              name: dbIngredient.name,
              quantity: ingredient.quantity,
              unit: dbIngredient.defaultUnit || ingredient.unit,
              category: dbIngredient.categoryName,
              shelfLifeDays: dbIngredient.shelfLifeDays,
              matched: true
            });
          } else {
            unmatchedIngredients.push(ingredient.name);
          }
        } catch (error) {
          console.error('Eşleştirme hatası:', error);
          unmatchedIngredients.push(ingredient.name);
        }
      }

      res.json({
        success: true,
        ingredients: matchedIngredients,
        unmatched: unmatchedIngredients,
        total: mockIngredients.length,
        matched: matchedIngredients.length,
        provider: 'mock (test mode)'
      });
      return;
    }

    // Fotoğrafı base64'e çevir
    const imageBase64 = imageFile.buffer.toString('base64');

    // Kullanıcının aktif AI entegrasyonunu bul
    // @ts-ignore
    let integration = await prisma.aIIntegration.findFirst({
      where: { userId, isActive: true }
    });

    // Ücretsiz Gemini kullan (Vision destekli)
    const FREE_GEMINI_KEY = process.env.FREE_GEMINI_API_KEY || 'AIzaSyBqTu9vK8xH2YmN3pL4rQ5sW6tX7yZ8aB9';
    
    let apiKey: string;
    let provider: string;

    if (!integration) {
      apiKey = FREE_GEMINI_KEY;
      provider = 'gemini';
    } else {
      apiKey = decryptApiKey(integration.apiKey);
      provider = integration.provider;
    }

    let ingredients: any[] = [];

    if (provider === 'openai') {
      // OpenAI Vision API (GPT-4 Vision)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Bu market fişindeki yiyecek ürünlerini listele. Sadece yiyecek/içecek ürünlerini al, temizlik ürünleri vs. alma. Her ürün için: isim, miktar, birim. JSON formatında döndür: [{"name": "...", "quantity": 1, "unit": "adet"}]. Eğer miktar belirtilmemişse 1 adet yaz.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      });

      const data: any = await response.json();

      if (!response.ok) {
        res.status(400).json({ 
          success: false, 
          message: 'OpenAI Vision API hatası: ' + (data.error?.message || 'Bilinmeyen hata') 
        });
        return;
      }

      const content = data.choices[0].message.content;
      try {
        ingredients = JSON.parse(content);
      } catch {
        res.json({ success: true, ingredients: [], message: content });
        return;
      }
    } else {
      // Gemini Vision API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: 'Bu market fişindeki yiyecek ürünlerini listele. Sadece yiyecek/içecek ürünlerini al, temizlik ürünleri vs. alma. Her ürün için: isim, miktar, birim. JSON formatında döndür: [{"name": "...", "quantity": 1, "unit": "adet"}]. Eğer miktar belirtilmemişse 1 adet yaz. Türkçe ürün isimleri kullan.'
              },
              {
                inline_data: {
                  mime_type: imageFile.mimetype,
                  data: imageBase64
                }
              }
            ]
          }]
        })
      });

      const data: any = await response.json();

      if (!response.ok || !data.candidates) {
        res.status(400).json({ 
          success: false, 
          message: 'Gemini Vision API hatası: ' + (data.error?.message || 'Bilinmeyen hata') 
        });
        return;
      }

      const content = data.candidates[0].content.parts[0].text;
      try {
        // JSON'u çıkar (markdown code block içinde olabilir)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          ingredients = JSON.parse(jsonMatch[0]);
        } else {
          ingredients = JSON.parse(content);
        }
      } catch {
        res.json({ success: true, ingredients: [], message: content });
        return;
      }
    }

    // Veritabanındaki malzemelerle eşleştir
    const matchedIngredients: any[] = [];
    const unmatchedIngredients: string[] = [];

    for (const ingredient of ingredients) {
      try {
        // Veritabanında ara
        const searchResult: any = await prisma.$queryRaw`
          SELECT i.name, i."defaultUnit", i."shelfLifeDays", c.name as "categoryName"
          FROM ingredients i
          JOIN categories c ON i."categoryId" = c.id
          WHERE LOWER(i.name) LIKE LOWER(${'%' + ingredient.name + '%'})
          LIMIT 1
        `;

        if (searchResult && searchResult.length > 0) {
          // Veritabanında bulundu
          const dbIngredient = searchResult[0];
          matchedIngredients.push({
            name: dbIngredient.name,
            quantity: ingredient.quantity || 1,
            unit: dbIngredient.defaultUnit || ingredient.unit || 'adet',
            category: dbIngredient.categoryName,
            shelfLifeDays: dbIngredient.shelfLifeDays,
            matched: true
          });
        } else {
          // Veritabanında yok
          unmatchedIngredients.push(ingredient.name);
        }
      } catch (error) {
        console.error('Malzeme eşleştirme hatası:', error);
        unmatchedIngredients.push(ingredient.name);
      }
    }

    res.json({ 
      success: true, 
      ingredients: matchedIngredients,
      unmatched: unmatchedIngredients,
      total: ingredients.length,
      matched: matchedIngredients.length,
      provider: integration ? provider : 'gemini (ücretsiz)'
    });
  } catch (error) {
    console.error('Fiş okuma hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// Fotoğraftan malzeme tanıma (AI Vision)
export const recognizeIngredients = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const imageFile = (req as any).file;

    if (!imageFile) {
      res.status(400).json({ success: false, message: 'Fotoğraf gerekli' });
      return;
    }

    // Fotoğrafı base64'e çevir
    const imageBase64 = imageFile.buffer.toString('base64');

    // Kullanıcının aktif AI entegrasyonunu bul
    // @ts-ignore
    let integration = await prisma.aIIntegration.findFirst({
      where: { userId, isActive: true }
    });

    // Ücretsiz Gemini kullan (Vision destekli)
    const FREE_GEMINI_KEY = process.env.FREE_GEMINI_API_KEY || 'AIzaSyBqTu9vK8xH2YmN3pL4rQ5sW6tX7yZ8aB9';
    
    let apiKey: string;
    let provider: string;

    if (!integration) {
      apiKey = FREE_GEMINI_KEY;
      provider = 'gemini';
    } else {
      apiKey = decryptApiKey(integration.apiKey);
      provider = integration.provider;
    }

    let ingredients: any[] = [];

    if (provider === 'openai') {
      // OpenAI Vision API (GPT-4 Vision)
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Bu fotoğraftaki yiyecek malzemelerini listele. Her malzeme için: isim, tahmini miktar, birim. JSON formatında döndür: [{"name": "...", "quantity": 1, "unit": "adet"}]'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: `data:image/jpeg;base64,${imageBase64}`
                  }
                }
              ]
            }
          ],
          max_tokens: 500
        })
      });

      const data: any = await response.json();

      if (!response.ok) {
        res.status(400).json({ 
          success: false, 
          message: 'OpenAI Vision API hatası: ' + (data.error?.message || 'Bilinmeyen hata') 
        });
        return;
      }

      const content = data.choices[0].message.content;
      try {
        ingredients = JSON.parse(content);
      } catch {
        // JSON parse hatası, metin olarak döndür
        res.json({ success: true, ingredients: [], message: content });
        return;
      }
    } else {
      // Gemini Vision API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: 'Bu fotoğraftaki yiyecek malzemelerini listele. Her malzeme için: isim, tahmini miktar, birim. JSON formatında döndür: [{"name": "...", "quantity": 1, "unit": "adet"}]'
              },
              {
                inline_data: {
                  mime_type: imageFile.mimetype,
                  data: imageBase64
                }
              }
            ]
          }]
        })
      });

      const data: any = await response.json();

      if (!response.ok || !data.candidates) {
        res.status(400).json({ 
          success: false, 
          message: 'Gemini Vision API hatası: ' + (data.error?.message || 'Bilinmeyen hata') 
        });
        return;
      }

      const content = data.candidates[0].content.parts[0].text;
      try {
        // JSON'u çıkar (markdown code block içinde olabilir)
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          ingredients = JSON.parse(jsonMatch[0]);
        } else {
          ingredients = JSON.parse(content);
        }
      } catch {
        // JSON parse hatası, metin olarak döndür
        res.json({ success: true, ingredients: [], message: content });
        return;
      }
    }

    res.json({ 
      success: true, 
      ingredients,
      provider: integration ? provider : 'gemini (ücretsiz)'
    });
  } catch (error) {
    console.error('Fotoğraf tanıma hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};

// AI ile tarif önerisi al (kullanıcının kendi API'si ile)
export const getRecipeSuggestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { ingredients } = req.body;

    if (!ingredients || ingredients.length === 0) {
      res.status(400).json({ success: false, message: 'Malzeme listesi gerekli' });
      return;
    }

    // Kullanıcının aktif AI entegrasyonunu bul (OpenAI veya Gemini)
    // @ts-ignore - Prisma client cache issue
    let integration = await prisma.aIIntegration.findFirst({
      where: { userId, isActive: true }
    });

    // Eğer kullanıcının entegrasyonu yoksa, ücretsiz Gemini kullan
    const FREE_GEMINI_KEY = process.env.FREE_GEMINI_API_KEY || 'AIzaSyBqTu9vK8xH2YmN3pL4rQ5sW6tX7yZ8aB9';
    
    let apiKey: string;
    let provider: string;
    let model: string;

    if (!integration) {
      // Ücretsiz Gemini kullan
      apiKey = FREE_GEMINI_KEY;
      provider = 'gemini';
      model = 'gemini-pro';
    } else {
      // Kullanıcının kendi API'sini kullan
      apiKey = decryptApiKey(integration.apiKey);
      provider = integration.provider;
      model = integration.model || (provider === 'openai' ? 'gpt-3.5-turbo' : 'gemini-pro');
    }

    let suggestions: string;

    if (provider === 'openai') {
      // OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: 'Sen bir yemek tarifi asistanısın. Verilen malzemelerle yapılabilecek tarifler öner.'
            },
            {
              role: 'user',
              content: `Elimde şu malzemeler var: ${ingredients.join(', ')}. Bu malzemelerle ne yapabilirim? 3 tarif öner.`
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      const data: any = await response.json();

      if (!response.ok) {
        res.status(400).json({ 
          success: false, 
          message: 'OpenAI API hatası: ' + (data.error?.message || 'Bilinmeyen hata') 
        });
        return;
      }

      suggestions = data.choices[0].message.content;
    } else {
      // Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Sen bir yemek tarifi asistanısın. Elimde şu malzemeler var: ${ingredients.join(', ')}. Bu malzemelerle ne yapabilirim? 3 tarif öner.`
            }]
          }]
        })
      });

      const data: any = await response.json();

      if (!response.ok || !data.candidates) {
        res.status(400).json({ 
          success: false, 
          message: 'Gemini API hatası: ' + (data.error?.message || 'Bilinmeyen hata') 
        });
        return;
      }

      suggestions = data.candidates[0].content.parts[0].text;
    }

    res.json({ 
      success: true, 
      suggestions,
      provider: integration ? provider : 'gemini (ücretsiz)'
    });
  } catch (error) {
    console.error('Tarif önerisi hatası:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası' });
  }
};
