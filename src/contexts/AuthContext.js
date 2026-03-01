import { createContext, useState, useEffect, useContext } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendVerificationEmail, generateVerificationCode } from '../services/emailService';
import { saveVerificationCode, verifyCode, isEmailVerified } from '../services/verificationService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const verificationResult = await isEmailVerified(firebaseUser.uid);
        if (verificationResult.verified) {
          setUser(firebaseUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const register = async (email, password, username) => {
    try {
      // Firebase Auth'ta kullanıcıyı oluştur (şifre sadece burada kullanılır, Firestore'a yazılmaz)
      let userCredential;
      try {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } catch (authError) {
        if (authError.code === 'auth/email-already-in-use') {
          return { success: false, error: 'Bu email adresi zaten kullanılıyor' };
        }
        throw authError;
      }

      const userId = userCredential.user.uid;
      const verificationCode = generateVerificationCode();

      // Şifre Firestore'a kaydedilmiyor, sadece doğrulama kodu saklanıyor
      await saveVerificationCode(email, username, userId, verificationCode);

      const emailResult = await sendVerificationEmail(email, verificationCode);
      if (!emailResult.success) {
        // Email gönderilemezse Firebase Auth kullanıcısını sil
        await userCredential.user.delete();
        return { success: false, error: 'Email gönderilemedi. Lütfen tekrar deneyin.' };
      }

      return { success: true, email };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Doğrulama sonrası Firestore'a kullanıcı profili ve streak oluşturur
  const completeRegistration = async (email, username) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Oturum bulunamadı. Lütfen tekrar deneyin.' };
      }

      const userId = currentUser.uid;

      await setDoc(doc(db, 'users', userId), {
        email,
        username,
        createdAt: new Date(),
        emailVerified: true,
        verifiedAt: new Date(),
      });

      await setDoc(doc(db, 'streaks', userId), {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckDate: new Date(),
        startDate: new Date(),
        relapses: 0,
      });

      // Kullanıcıyı app state'e ekle - ana ekrana yönlendirir
      setUser(currentUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const ensureUserProfile = async (firebaseUser) => {
    const userId = firebaseUser.uid;
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const username = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User';

    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: firebaseUser.email,
        username,
        createdAt: new Date(),
        emailVerified: true,
        verifiedAt: new Date(),
      });
    } else if (!userDoc.data().emailVerified) {
      await setDoc(userRef, { emailVerified: true, verifiedAt: new Date() }, { merge: true });
    }

    const streakRef = doc(db, 'streaks', userId);
    const streakDoc = await getDoc(streakRef);
    if (!streakDoc.exists()) {
      await setDoc(streakRef, {
        userId,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckDate: new Date(),
        startDate: new Date(),
        relapses: 0,
      });
    }
  };

  const loginWithGoogle = async (idToken) => {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      await ensureUserProfile(userCredential.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      const verificationResult = await isEmailVerified(userId);
      if (!verificationResult.verified) {
        await firebaseSignOut(auth);
        return { success: false, error: 'EMAIL_NOT_VERIFIED', userId, email };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const resendVerificationEmail = async (email, username) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        return { success: false, error: 'Oturum bulunamadı' };
      }

      const userId = currentUser.uid;
      const verificationCode = generateVerificationCode();
      await saveVerificationCode(email, username, userId, verificationCode);

      const emailResult = await sendVerificationEmail(email, verificationCode);
      if (!emailResult.success) {
        return { success: false, error: 'Email gönderilemedi. Lütfen tekrar deneyin.' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const verifyEmailCode = async (email, code) => {
    try {
      const result = await verifyCode(email, code);
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      register,
      completeRegistration,
      loginWithGoogle,
      login,
      logout,
      resendVerificationEmail,
      verifyEmailCode
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
