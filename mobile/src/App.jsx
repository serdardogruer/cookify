import { useState, useEffect } from 'react';

// Frontend URL'i - web uygulamanızın URL'i
const FRONTEND_URL = 'http://localhost:3000';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Splash screen simülasyonu
    setTimeout(() => setIsLoading(false), 2000);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#121212',
        color: 'white',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🍳</div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold' }}>Cookify</h1>
        <p style={{ color: '#A0A0A0', marginTop: '10px' }}>Akıllı Mutfak Yönetimi</p>
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
