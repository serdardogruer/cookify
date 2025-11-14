import { useState, useEffect } from 'react';
import { StatusBar, Style } from '@capacitor/status-bar';

// Vercel URL'ini buraya yapıştır
const FRONTEND_URL = 'https://cookify-ecru-alpha.vercel.app';

function App() {
  const [isLoading, setIsLoading] = useState(true);

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
    <iframe
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
  );
}

export default App;
