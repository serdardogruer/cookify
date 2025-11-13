// Basit toast notification sistemi - 2 saniyede kaybolur
export const toast = {
  success: (message: string) => {
    showToast(message, 'success');
  },
  error: (message: string) => {
    showToast(message, 'error');
  },
  info: (message: string) => {
    showToast(message, 'info');
  },
};

export function showToast(message: string, type: 'success' | 'error' | 'info') {
  // Toast container'ı oluştur (yoksa)
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(container);
  }

  // Toast elementi oluştur
  const toastEl = document.createElement('div');
  const bgColor = type === 'success' ? '#30D158' : type === 'error' ? '#FF453A' : '#0A84FF';
  
  toastEl.style.cssText = `
    background: ${bgColor};
    color: white;
    padding: 14px 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    font-size: 14px;
    font-weight: 500;
    max-width: 320px;
    animation: slideIn 0.3s ease-out;
  `;
  toastEl.textContent = message;

  // Animasyon ekle
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(toastEl);

  // 3 saniye sonra kaldır
  setTimeout(() => {
    toastEl.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => {
      container?.removeChild(toastEl);
      // Container boşsa kaldır
      if (container && container.children.length === 0) {
        document.body.removeChild(container);
      }
    }, 300);
  }, 3000);
}
