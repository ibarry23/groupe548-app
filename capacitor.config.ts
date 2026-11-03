import type { CapacitorConfig } from '@capacitor/cli';

// Native shells (iOS / Android) are generated with `npm run cap:add:ios` /
// `npm run cap:add:android` after `npm run build`. They load the same web build.
const config: CapacitorConfig = {
  appId: 'ca.groupe548.app',
  appName: 'Groupe 548',
  webDir: 'dist',
  backgroundColor: '#FBF8F3',
  ios: { contentInset: 'never', scheme: 'Groupe 548' },
  android: { allowMixedContent: false },
};

export default config;
