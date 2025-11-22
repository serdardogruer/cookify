'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import DashboardHeader from '@/components/DashboardHeader';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function AIAssistantPage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [pantryItems, setPantryItems] = useState<any[]>([]);
  const [loadingPantry, setLoadingPantry] = useState(true);
  const [newIngredient, setNewIngredient] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Fotoğraf tanıma
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Fiş yükleme
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  
  // Sesli komut
  const [isListening, setIsListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');

  useEffect(() => {
    loadPantryItems();
  }, []);

  const loadPantryItems = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/pantry`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success) {
        const items = data.data || [];
        setPantryItems(items);
        const itemNames = items.map((item: any) => item.name);
        setIngredients(itemNames);
      }
    } catch (error) {
      console.error('Dolap yükleme hatası:', error);
    } finally {
      setLoadingPantry(false);
    }
  };

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleGetSuggestions = async () => {
    if (ingredients.length === 0) {
      toast.error('Lütfen en az bir malzeme ekleyin');
      return;
    }

    setLoadingSuggestions(true);
    setSuggestions('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/ai/recipe-suggestions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ingredients })
      });

      const data = await response.json();

      if (data.success) {
        setSuggestions(data.suggestions);
        toast.success('Tarif önerileri alındı!');
      } else {
        toast.error(data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Tarif önerisi hatası:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    toast.success('📸 Fotoğraf analiz ediliyor...');
    
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/api/ai/recognize-ingredients`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success && data.ingredients && data.ingredients.length > 0) {
        // Tanınan malzemeleri dolaba ekle
        for (const ingredient of data.ingredients) {
          try {
            await fetch(`${API_URL}/api/pantry`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                name: ingredient.name,
                category: 'DIGER', // AI kategorisi belirleyemez, varsayılan
                quantity: ingredient.quantity || 1,
                unit: ingredient.unit || 'adet'
              })
            });
          } catch (error) {
            console.error('Malzeme ekleme hatası:', error);
          }
        }
        
        toast.success(`✅ ${data.ingredients.length} malzeme tanındı ve dolaba eklendi!`);
        loadPantryItems(); // Dolabı yenile
      } else if (data.message) {
        toast.error('Malzeme tanınamadı: ' + data.message);
      } else {
        toast.error('Fotoğrafta malzeme bulunamadı');
      }
    } catch (error) {
      console.error('Fotoğraf tanıma hatası:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setUploadingPhoto(false);
      // Input'u temizle (aynı fotoğrafı tekrar seçebilmek için)
      e.target.value = '';
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    toast.success('📄 Fiş okunuyor...');
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('Oturum süresi dolmuş, lütfen tekrar giriş yapın');
        setUploadingReceipt(false);
        return;
      }
      
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_URL}/api/ai/scan-receipt`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success && data.ingredients && data.ingredients.length > 0) {
        // Eşleşen ürünleri dolaba ekle
        for (const ingredient of data.ingredients) {
          try {
            // SKT hesapla
            const shelfLifeDays = ingredient.shelfLifeDays || 30;
            const today = new Date();
            const expiryDate = new Date(today.getTime() + shelfLifeDays * 24 * 60 * 60 * 1000);
            const formattedExpiryDate = expiryDate.toISOString().split('T')[0];

            await fetch(`${API_URL}/api/pantry`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                name: ingredient.name,
                category: ingredient.category || 'DIGER',
                quantity: ingredient.quantity || 1,
                unit: ingredient.unit || 'adet',
                expiryDate: formattedExpiryDate
              })
            });
          } catch (error) {
            console.error('Ürün ekleme hatası:', error);
          }
        }
        
        // Sonuç mesajı
        let message = `✅ ${data.matched}/${data.total} ürün dolaba eklendi!`;
        if (data.unmatched && data.unmatched.length > 0) {
          message += `\n⚠️ Tanınmayan: ${data.unmatched.join(', ')}`;
        }
        toast.success(message);
        loadPantryItems();
      } else if (data.message) {
        toast.error('Ürün okunamadı: ' + data.message);
      } else {
        toast.error('Fişte tanıdığımız ürün bulunamadı');
      }
    } catch (error) {
      console.error('Fiş okuma hatası:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setUploadingReceipt(false);
      e.target.value = '';
    }
  };

  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast.error('Tarayıcınız sesli komut desteklemiyor');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = true; // Ara sonuçları göster
    recognition.maxAlternatives = 3; // Daha fazla alternatif dene

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceText('');
      toast.success('🎤 Dinliyorum... Normal konuşun!');
    };
    
    // Ara sonuçları göster (kullanıcı ne söylediğini görsün)
    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      
      // Ara sonuç (henüz bitmedi)
      if (!event.results[current].isFinal) {
        setVoiceText(transcript);
        return;
      }
      
      // Final sonuç - işleme başla
      handleFinalTranscript(transcript);
    };

    // Malzeme kategorisi belirleme fonksiyonu (DB kategorileriyle uyumlu)
    const getCategoryFromIngredient = (ingredient: string): string => {
      const lowerIngredient = ingredient.toLowerCase();
      
      // SEBZELER
      const vegetables = ['domates', 'salatalık', 'biber', 'patlıcan', 'kabak', 'havuç', 'soğan', 'sarımsak', 'patates', 'marul', 'maydanoz', 'dereotu', 'nane', 'roka', 'ıspanak', 'lahana', 'karnabahar', 'brokoli', 'kereviz', 'pırasa', 'mantar', 'turp', 'pancar'];
      if (vegetables.some(v => lowerIngredient.includes(v))) return 'SEBZELER';
      
      // MEYVELER
      const fruits = ['elma', 'armut', 'muz', 'portakal', 'mandalina', 'limon', 'karpuz', 'kavun', 'üzüm', 'çilek', 'kiraz', 'şeftali', 'kayısı', 'erik', 'kivi', 'ananas', 'avokado', 'nar', 'incir', 'hurma', 'dut', 'böğürtlen', 'ahududu'];
      if (fruits.some(f => lowerIngredient.includes(f))) return 'MEYVELER';
      
      // ET_URUNLERI
      const meat = ['tavuk', 'et', 'dana', 'kuzu', 'kıyma', 'köfte', 'sucuk', 'sosis', 'jambon', 'salam', 'hindi', 'ciğer', 'but', 'göğüs', 'kanat'];
      if (meat.some(m => lowerIngredient.includes(m))) return 'ET_URUNLERI';
      
      // SUT_URUNLERI
      const dairy = ['süt', 'yoğurt', 'peynir', 'kaşar', 'beyaz peynir', 'lor', 'tereyağı', 'margarin', 'krema', 'labne', 'ayran', 'kefir'];
      if (dairy.some(d => lowerIngredient.includes(d))) return 'SUT_URUNLERI';
      
      // TAHILLAR
      const grains = ['pirinç', 'bulgur', 'makarna', 'nohut', 'mercimek', 'fasulye', 'bezelye', 'barbunya', 'börülce', 'arpa', 'yulaf', 'kinoa', 'buğday'];
      if (grains.some(g => lowerIngredient.includes(g))) return 'TAHILLAR';
      
      // BAHARATLAR
      const spices = ['tuz', 'karabiber', 'kırmızı biber', 'pul biber', 'kimyon', 'kekik', 'fesleğen', 'biberiye', 'tarçın', 'zencefil', 'zerdeçal', 'sumak', 'köri', 'hardal', 'vanilya'];
      if (spices.some(s => lowerIngredient.includes(s))) return 'BAHARATLAR';
      
      // ICECEKLER
      const beverages = ['su', 'çay', 'kahve', 'meyve suyu', 'kola', 'gazoz', 'ayran', 'şalgam', 'limonata'];
      if (beverages.some(b => lowerIngredient.includes(b))) return 'ICECEKLER';
      
      // ATISTIRMALIKLAR
      const snacks = ['çikolata', 'bisküvi', 'cips', 'kuruyemiş', 'fındık', 'fıstık', 'badem', 'ceviz', 'kaju', 'kuru üzüm', 'kuru kayısı', 'kuru incir'];
      if (snacks.some(s => lowerIngredient.includes(s))) return 'ATISTIRMALIKLAR';
      
      // DIGER (varsayılan)
      return 'DIGER';
    };

    const handleFinalTranscript = async (transcript: string) => {
      const cleanTranscript = transcript.trim();
      setVoiceText(cleanTranscript);
      
      // Miktar ve birim içeren komutları dolaba ekle
      const words = cleanTranscript.toLowerCase().split(' ').filter((w: string) => w.length > 0);
      
      const birimIndex = words.findIndex((w: string) => 
        w === 'adet' || 
        w === 'tane' || 
        w === 'kilo' || 
        w === 'gram' || 
        w === 'litre'
      );
      
      // Birim bulunduysa ve "ekle" kelimesi varsa dolaba ekle
      if (birimIndex > 0 && birimIndex < words.length - 1 && words.includes('ekle')) {
        const miktar = parseFloat(words[birimIndex - 1]) || 1;
        const birim = words[birimIndex]; // adet, kilo, gram, litre
        
        // Malzeme adını çıkar (birimden sonraki kelimeler, "ekle" hariç)
        const malzemeWords = words.slice(birimIndex + 1).filter((w: string) => w !== 'ekle' && w !== 'koy' && w !== 'at');
        const malzeme = malzemeWords.join(' ').trim();
        
        if (!malzeme) {
          toast.error('Malzeme adını anlayamadım. Örnek: "2 kilo patlıcan ekle"');
          return;
        }
        
        // Önce veritabanından malzeme bilgisini ara
        let kategori = '';
        let shelfLifeDays = 30;
        let defaultUnit = birim;
        
        try {
          const token = localStorage.getItem('token');
          const searchResponse = await fetch(
            `${API_URL}/api/categories/ingredients/search?q=${encodeURIComponent(malzeme)}&limit=1`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const searchData = await searchResponse.json();
          
          if (searchData.success && searchData.data && searchData.data.length > 0) {
            // Veritabanında bulundu
            const ingredient = searchData.data[0];
            kategori = ingredient.category.name;
            shelfLifeDays = ingredient.shelfLifeDays || 30;
            defaultUnit = ingredient.defaultUnit || birim;
          } else {
            // Veritabanında yok, otomatik belirle
            kategori = getCategoryFromIngredient(malzeme);
            const getDefaultShelfLife = (category: string): number => {
              const shelfLifeMap: { [key: string]: number } = {
                'SEBZELER': 7,
                'MEYVELER': 7,
                'ET_URUNLERI': 3,
                'SUT_URUNLERI': 7,
                'TAHILLAR': 365,
                'BAHARATLAR': 365,
                'ICECEKLER': 30,
                'ATISTIRMALIKLAR': 90,
                'DIGER': 30
              };
              return shelfLifeMap[category] || 30;
            };
            shelfLifeDays = getDefaultShelfLife(kategori);
          }
        } catch (error) {
          // Hata olursa otomatik belirle
          kategori = getCategoryFromIngredient(malzeme);
        }
        
        // SKT hesapla
        const today = new Date();
        const expiryDate = new Date(today.getTime() + shelfLifeDays * 24 * 60 * 60 * 1000);
        const formattedExpiryDate = expiryDate.toISOString().split('T')[0];
        
        // Database'e ekle
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`${API_URL}/api/pantry`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              name: malzeme,
              category: kategori,
              quantity: miktar,
              unit: birim,
              expiryDate: formattedExpiryDate
            })
          });

          const data = await response.json();

          if (data.success) {
            toast.success(`✅ ${miktar} ${birim} ${malzeme} dolabına eklendi!`);
            loadPantryItems(); // Dolabı yenile
          } else {
            toast.error('Dolaba eklenemedi: ' + (data.message || 'Bilinmeyen hata'));
          }
        } catch (error) {
          console.error('Dolaba ekleme hatası:', error);
          toast.error('Bir hata oluştu');
        }
      } else {
        // Normal malzeme olarak ekle (sadece listeye)
        toast.success(`Anladım: "${cleanTranscript}"`);
        setIngredients([...ingredients, cleanTranscript]);
      }
    };

    recognition.onerror = () => {
      toast.error('Ses tanıma hatası');
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-[#111111]">
      <DashboardHeader />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-white text-3xl font-bold mb-2">🤖 AI Asistan</h1>
          <p className="text-[#A0A0A0]">
            Yapay zeka ile akıllı tarif önerileri alın
          </p>
          <p className="text-[#666] text-sm mt-2">
            💡 API ayarlarını Profil → AI Ayarları sekmesinden yapabilirsiniz
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1E1E1E] rounded-xl p-6">
            {loadingPantry ? (
              <div className="text-[#A0A0A0] text-center py-8">
                <div className="animate-spin text-4xl mb-3">⏳</div>
                <p>Dolap yükleniyor...</p>
              </div>
            ) : ingredients.length === 0 ? (
              <div className="py-8">
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">🍳</div>
                  <h3 className="text-white text-xl font-bold mb-2">Dolabınız Boş</h3>
                  <p className="text-[#A0A0A0] mb-6">
                    Sesli komut veya fotoğraf ile malzeme ekleyebilirsiniz
                  </p>
                </div>

                {/* Fotoğraf, Fiş ve Sesli Komut */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <label className="bg-[#2C2C2C] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#3C3C3C] transition cursor-pointer flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">📸</span>
                    <span className="text-xs text-center">Fotoğraf</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                  <label className="bg-[#2C2C2C] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#3C3C3C] transition cursor-pointer flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">📄</span>
                    <span className="text-xs text-center">Fiş Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      disabled={uploadingReceipt}
                    />
                  </label>
                  <button
                    onClick={handleVoiceCommand}
                    disabled={isListening}
                    className="bg-[#2C2C2C] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#3C3C3C] transition disabled:opacity-50 flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-2xl">{isListening ? '🔴' : '🎤'}</span>
                    <span className="text-xs text-center">{isListening ? 'Dinliyorum' : 'Sesli Komut'}</span>
                  </button>
                </div>

                {/* Ses tanıma sonucu göster */}
                {isListening && voiceText && (
                  <div className="mb-6 bg-[#2C2C2C] rounded-lg p-4 border-2 border-[#30D158]">
                    <p className="text-[#A0A0A0] text-xs mb-1">Söylediğiniz:</p>
                    <p className="text-white text-lg">{voiceText}</p>
                  </div>
                )}

                <div className="text-center">
                  <p className="text-[#666] text-sm mb-4">veya</p>
                  <a
                    href="/dashboard/pantry"
                    className="inline-flex items-center gap-2 bg-[#30D158] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#28a745] transition"
                  >
                    <span className="material-symbols-outlined">kitchen</span>
                    <span>Dolabıma Git</span>
                  </a>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white text-xl font-bold">Dolabımdaki Malzemeler</h2>
                  <button
                    onClick={loadPantryItems}
                    className="text-[#30D158] hover:text-[#28a745] transition flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined">refresh</span>
                    <span className="text-sm">Yenile</span>
                  </button>
                </div>
                <p className="text-[#A0A0A0] text-sm mb-4">
                  {ingredients.length} malzeme bulundu. İstersen ekstra malzeme ekleyebilirsin.
                </p>
                
                <div className="flex gap-3 mb-4">
                  <input
                    type="text"
                    value={newIngredient}
                    onChange={(e) => setNewIngredient(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                    placeholder="Ekstra malzeme ekle (opsiyonel)"
                    className="flex-1 bg-[#2C2C2C] text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#30D158]"
                  />
                  <button
                    onClick={handleAddIngredient}
                    className="bg-[#30D158] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#28a745] transition"
                  >
                    Ekle
                  </button>
                </div>

                {/* Fotoğraf, Fiş ve Sesli Komut */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <label className="bg-[#2C2C2C] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#3C3C3C] transition cursor-pointer flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">📸</span>
                    <span className="text-xs text-center">Fotoğraf</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto}
                    />
                  </label>
                  <label className="bg-[#2C2C2C] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#3C3C3C] transition cursor-pointer flex flex-col items-center justify-center gap-2">
                    <span className="text-2xl">📄</span>
                    <span className="text-xs text-center">Fiş Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      disabled={uploadingReceipt}
                    />
                  </label>
                  <button
                    onClick={handleVoiceCommand}
                    disabled={isListening}
                    className="bg-[#2C2C2C] text-white px-4 py-3 rounded-lg font-medium hover:bg-[#3C3C3C] transition disabled:opacity-50 flex flex-col items-center justify-center gap-2"
                  >
                    <span className="text-2xl">{isListening ? '🔴' : '🎤'}</span>
                    <span className="text-xs text-center">{isListening ? 'Dinliyorum' : 'Sesli Komut'}</span>
                  </button>
                </div>

                {/* Ses tanıma sonucu göster */}
                {isListening && voiceText && (
                  <div className="mb-4 bg-[#2C2C2C] rounded-lg p-4 border-2 border-[#30D158]">
                    <p className="text-[#A0A0A0] text-xs mb-1">Söylediğiniz:</p>
                    <p className="text-white text-lg">{voiceText}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {ingredients.map((ingredient, index) => (
                    <div
                      key={index}
                      className="bg-[#2C2C2C] text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                      <span>{ingredient}</span>
                      <button
                        onClick={() => handleRemoveIngredient(index)}
                        className="text-red-500 hover:text-red-400 text-xl"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleGetSuggestions}
                  disabled={loadingSuggestions || ingredients.length === 0}
                  className="w-full bg-[#30D158] text-white py-4 rounded-xl font-bold hover:bg-[#28a745] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingSuggestions ? '🤔 AI düşünüyor...' : '✨ Tarif Önerisi Al'}
                </button>
              </>
            )}
          </div>

          {suggestions && (
            <div className="bg-[#1E1E1E] rounded-xl p-6">
              <h2 className="text-white text-xl font-bold mb-4">🍳 AI Önerileri</h2>
              <div className="text-[#A0A0A0] whitespace-pre-wrap leading-relaxed">
                {suggestions}
              </div>
            </div>
          )}

          {/* Mevcut Özellikler */}
          <div className="bg-[#1E1E1E] rounded-xl p-6">
            <h2 className="text-white text-xl font-bold mb-4">✨ Mevcut Özellikler</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-[#30D158] text-xl">✅</span>
                <div>
                  <h4 className="text-white font-medium">"Ne pişirsem?" sorusuna cevap</h4>
                  <p className="text-[#A0A0A0] text-sm">Dolabındaki malzemelere göre tarif önerileri</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#30D158] text-xl">✅</span>
                <div>
                  <h4 className="text-white font-medium">Dolaptaki malzemeleri değerlendir</h4>
                  <p className="text-[#A0A0A0] text-sm">Hiçbir malzeme ziyan olmasın</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#30D158] text-xl">✅</span>
                <div>
                  <h4 className="text-white font-medium">Yeni tarifler keşfet</h4>
                  <p className="text-[#A0A0A0] text-sm">AI'dan ilham al, farklı lezzetler dene</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#30D158] text-xl">✅</span>
                <div>
                  <h4 className="text-white font-medium">Market'e gitmeden pişir</h4>
                  <p className="text-[#A0A0A0] text-sm">Evdeki malzemelerle harika yemekler</p>
                </div>
              </div>
            </div>
          </div>

          {/* Yakında Gelecek */}
          <div className="bg-[#1E1E1E] rounded-xl p-6 border border-[#FF9500]/20">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-white text-xl font-bold">🚀 Yakında Gelecek</h2>
              <span className="bg-[#FF9500] text-white text-xs px-2 py-1 rounded">BETA</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-[#FF9500] text-xl">📸</span>
                <div>
                  <h4 className="text-white font-medium">Fotoğraf Tanıma</h4>
                  <p className="text-[#A0A0A0] text-sm">Malzeme fotoğrafı çek, AI otomatik tanısın</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#FF9500] text-xl">🎤</span>
                <div>
                  <h4 className="text-white font-medium">Sesli Komut</h4>
                  <p className="text-[#A0A0A0] text-sm">"Dolabımda ne var?" diye sor, AI cevaplasın</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#FF9500] text-xl">🔥</span>
                <div>
                  <h4 className="text-white font-medium">Kalori Hesaplama</h4>
                  <p className="text-[#A0A0A0] text-sm">Tariflerin kalori ve besin değerlerini gör</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#FF9500] text-xl">💰</span>
                <div>
                  <h4 className="text-white font-medium">Bütçe Optimizasyonu</h4>
                  <p className="text-[#A0A0A0] text-sm">En ekonomik tarifleri AI önersin</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
