interface ConsumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    name: string;
    quantity: number;
    unit: string;
  } | null;
  consumeAmount: string;
  setConsumeAmount: (value: string) => void;
  onSubmit: () => void;
}

export default function ConsumeModal({
  isOpen,
  onClose,
  item,
  consumeAmount,
  setConsumeAmount,
  onSubmit,
}: ConsumeModalProps) {
  if (!isOpen || !item) return null;

  // Birime göre hızlı seçenekler
  const getQuickAmounts = () => {
    const unit = item.unit.toLowerCase();
    
    if (unit.includes('kg') || unit.includes('kilogram')) {
      return [
        { label: '0.1 kg', value: '0.1' },
        { label: '0.25 kg', value: '0.25' },
        { label: '0.5 kg', value: '0.5' },
        { label: '1 kg', value: '1' },
      ];
    } else if (unit.includes('gram') || unit === 'gr' || unit === 'g') {
      return [
        { label: '100g', value: '100' },
        { label: '250g', value: '250' },
        { label: '500g', value: '500' },
        { label: '1000g', value: '1000' },
      ];
    } else if (unit.includes('litre') || unit === 'lt' || unit === 'l') {
      return [
        { label: '0.1 L', value: '0.1' },
        { label: '0.25 L', value: '0.25' },
        { label: '0.5 L', value: '0.5' },
        { label: '1 L', value: '1' },
      ];
    } else if (unit.includes('ml') || unit.includes('mililitre')) {
      return [
        { label: '100ml', value: '100' },
        { label: '250ml', value: '250' },
        { label: '500ml', value: '500' },
        { label: '1000ml', value: '1000' },
      ];
    } else if (unit.includes('adet') || unit.includes('piece')) {
      return [
        { label: '1 adet', value: '1' },
        { label: '2 adet', value: '2' },
        { label: '3 adet', value: '3' },
        { label: '5 adet', value: '5' },
      ];
    } else {
      // Genel seçenekler
      return [
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '5', value: '5' },
        { label: '10', value: '10' },
      ];
    }
  };

  const quickAmounts = getQuickAmounts();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-md rounded-xl bg-[#1E1E1E] p-6">
        <h3 className="mb-4 text-xl font-bold text-white">Stok Düş</h3>
        <p className="mb-4 text-sm text-[#A0A0A0]">
          {item.name} - Mevcut: {item.quantity} {item.unit}
        </p>

        {/* Hızlı Seçenekler */}
        <div className="mb-4 grid grid-cols-4 gap-2">
          {quickAmounts.map((quick) => (
            <button
              key={quick.value}
              onClick={() => setConsumeAmount(quick.value)}
              className="rounded-lg bg-[#121212] py-2 text-sm font-medium text-white hover:bg-[#30D158] transition"
            >
              {quick.label}
            </button>
          ))}
        </div>

        {/* Manuel Miktar */}
        <input
          type="number"
          value={consumeAmount}
          onChange={(e) => setConsumeAmount(e.target.value)}
          placeholder="Miktar girin"
          className="mb-4 w-full rounded-lg bg-[#121212] px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#30D158]"
        />

        {/* Butonlar */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-gray-600 py-3 text-base font-medium text-white transition-colors hover:bg-gray-500"
          >
            İptal
          </button>
          <button
            onClick={onSubmit}
            className="flex-1 rounded-lg bg-[#30D158] py-3 text-base font-medium text-white transition-colors hover:bg-[#30D158]/90"
          >
            Düş
          </button>
        </div>
      </div>
    </div>
  );
}
