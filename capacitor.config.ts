import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.opera.mobile',
  appName: 'Opera Mobile',
  webDir: 'dist',
  android: {
    allowMixedContent: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  },
  // server: {
  //   androidScheme : 'https',
    
  // }
};

export default config;
