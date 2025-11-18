import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cookify.app',
  appName: 'Cookify',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: ['*'],
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#121212',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#121212',
    },
  },
};

export default config;
