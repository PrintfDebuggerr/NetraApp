import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';

const AuthContext = createContext({});

const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNewUser, setIsNewUser] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Use the Expo Go scheme for redirect
  const redirectUri = Linking.createURL('auth');

  console.log('🔗 Redirect URI:', redirectUri);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔥 Firebase auth state:', firebaseUser?.email || 'null');

      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          setIsNewUser(!userDoc.exists());
          setUser(firebaseUser);
        } catch (error) {
          console.error('Error checking user doc:', error);
          setUser(firebaseUser);
          setIsNewUser(true);
        }
      } else {
        setUser(null);
        setIsNewUser(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Generate random string for nonce/state
  const generateRandomString = (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const signInWithGoogle = async () => {
    console.log('🚀 signInWithGoogle called');
    setAuthError(null);
    setGoogleLoading(true);

    try {
      const state = generateRandomString(16);
      const nonce = generateRandomString(32);

      // Build Google OAuth URL directly
      const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      googleAuthUrl.searchParams.set('client_id', GOOGLE_WEB_CLIENT_ID);
      googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
      googleAuthUrl.searchParams.set('response_type', 'id_token');
      googleAuthUrl.searchParams.set('scope', 'openid profile email');
      googleAuthUrl.searchParams.set('state', state);
      googleAuthUrl.searchParams.set('nonce', nonce);

      console.log('📤 Opening auth URL:', googleAuthUrl.toString());

      const result = await WebBrowser.openAuthSessionAsync(
        googleAuthUrl.toString(),
        redirectUri
      );

      console.log('📥 WebBrowser result:', JSON.stringify(result, null, 2));

      if (result.type === 'success') {
        const url = result.url;
        console.log('✅ Got redirect URL:', url);

        // Parse the URL to get id_token from fragment
        const fragmentString = url.split('#')[1];
        if (fragmentString) {
          const params = new URLSearchParams(fragmentString);
          const idToken = params.get('id_token');
          const returnedState = params.get('state');

          console.log('🎫 Got id_token:', !!idToken);
          console.log('🔐 State matches:', state === returnedState);

          if (idToken) {
            await signInWithIdToken(idToken);
          } else {
            setAuthError('id_token bulunamadı');
            setGoogleLoading(false);
          }
        } else {
          console.error('❌ No fragment in URL');
          setAuthError('Token alınamadı');
          setGoogleLoading(false);
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        console.log('ℹ️ User cancelled');
        setGoogleLoading(false);
      } else {
        console.error('❌ Unexpected result:', result);
        setAuthError('Giriş başarısız');
        setGoogleLoading(false);
      }
    } catch (error) {
      console.error('❌ Auth error:', error);
      setAuthError(error.message);
      setGoogleLoading(false);
    }
  };

  const signInWithIdToken = async (idToken) => {
    try {
      console.log('🔐 Signing into Firebase...');

      const credential = GoogleAuthProvider.credential(idToken);
      const result = await signInWithCredential(auth, credential);

      console.log('✅ Firebase sign-in successful:', result.user.email);

      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      setIsNewUser(!userDoc.exists());
      setGoogleLoading(false);
    } catch (error) {
      console.error('❌ Firebase error:', error.code, error.message);
      setAuthError(error.message);
      setGoogleLoading(false);
    }
  };

  const completeProfile = async (username) => {
    if (!user) return { success: false, error: 'NO_USER' };

    try {
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        username,
        displayName: user.displayName || null,
        photoURL: user.photoURL || null,
        createdAt: new Date(),
        emailVerified: true,
        verifiedAt: new Date(),
      });

      await setDoc(doc(db, 'streaks', user.uid), {
        userId: user.uid,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckDate: new Date(),
        startDate: new Date(),
        relapses: 0,
      });

      setIsNewUser(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setIsNewUser(false);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isNewUser,
      authError,
      googleLoading,
      googleAuthReady: true,
      signInWithGoogle,
      completeProfile,
      logout,
      clearAuthError: () => setAuthError(null),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
