import Constants from 'expo-constants';

const getExpoExtra = () => {
  const expoConfig = Constants.expoConfig ?? Constants.manifest;
  return expoConfig?.extra ?? {};
};

export const getGoogleAuthConfig = () => {
  const extra = getExpoExtra();

  return {
    expoClientId: extra.googleExpoClientId || '',
    iosClientId: extra.googleIosClientId || '',
    androidClientId: extra.googleAndroidClientId || '',
    webClientId: extra.googleWebClientId || '',
  };
};
