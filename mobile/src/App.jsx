import { useState, useEffect, useRef } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';

// VDS URL
const FRONTEND_URL = 'http://80.253.246.134';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const iframeRef = useRef(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const pullDistance = useRef(0);

  useEffect(() => {
    // Status bar'ı gizle
    const hideStatusBar = async () => {
      try {
        await StatusBar.hide();
      } catch (error) {
        console.log('StatusBar not available');
      }
    };
    
    hideStatusBar();
    
    // Splash screen simülasyonu
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  // Pull-to-refresh handler
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    const touchY = e.touches[0].clientY;
    const touchX = e.touches[0].clientX;
    const deltaY = touchY - touchStartY.current;
    const deltaX = touchX - touchStartX.current;

    // Pull-to-refresh: Sadece yukarıdan aşağı çekildiğinde
    if (deltaY > 0 && Math.abs(deltaX) < 50 && window.scrollY === 0) {
      pullDistance.current = Math.min(deltaY, 100);
      
      // Refresh threshold (80px)
      if (pullDistance.current > 80 && !refreshing) {
        handleRefresh();
      }
    }
  };

  const handleTouchEnd = () => {
    pullDistance.current = 0;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    
    // iframe'i yeniden yükle
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        iframeRef.current.src = currentSrc;
        setRefreshing(false);
      }, 500);
    }
  };

  // Swipe navigation için mesaj gönder
  useEffect(() => {
    const handleSwipe = (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchEndX - touchStartX.current;
      const deltaY = touchEndY - touchStartY.current;

      // Yatay swipe (dikey swipe'dan daha fazla)
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          // Sağa swipe (geri git)
          if (deltaX > 0) {
            iframeRef.current.contentWindow.postMessage({ type: 'swipe', direction: 'right' }, '*');
          }
          // Sola swipe (ileri git)
          else {
            iframeRef.current.contentWindow.postMessage({ type: 'swipe', direction: 'left' }, '*');
          }
        }
      }
    };

    document.addEventListener('touchend', handleSwipe);
    return () => document.removeEventListener('touchend', handleSwipe);
  }, []);

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#121212',
          color: 'white',
        }}
      >
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍳</div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Cookify</h1>
        <p style={{ color: '#A0A0A0', marginTop: '10px' }}>
          Akıllı Mutfak Yönetimi
        </p>
      </div>
    );
  }

  return (
    <div
      style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Refresh indicator */}
      {refreshing && (
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: '#30D158',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
        >
          Yenileniyor...
        </div>
      )}

      <iframe
        ref={iframeRef}
        src={FRONTEND_URL}
        style={{
          width: '100%',
          height: '100vh',
          border: 'none',
          margin: 0,
          padding: 0,
        }}
        title="Cookify"
      />
    </div>
  );
}

export default App;
