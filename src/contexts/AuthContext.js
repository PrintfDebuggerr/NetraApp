import React, { createContext, useState, useEffect, useContext } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { sendVerificationEmail, generateVerificationCode } from '../services/emailService';
import { saveVerificationCode, verifyCode, isEmailVerified, checkEmailExists } from '../services/verificationService';

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
      const emailCheck = await checkEmailExists(email);
      if (!emailCheck.success) {
        return { success: false, error: 'Email kontrolü yapılamadı' };
      }
      if (emailCheck.exists) {
        return { success: false, error: 'Bu email adresi zaten kullanılıyor' };
      }

      const verificationCode = generateVerificationCode();
      await saveVerificationCode(email, password, username, verificationCode);
      
      const emailResult = await sendVerificationEmail(email, verificationCode);
      if (!emailResult.success) {
        return { success: false, error: 'Email gönderilemedi. Lütfen tekrar deneyin.' };
      }

      return { success: true, email: email };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const completeRegistration = async (email, password, username) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const userId = userCredential.user.uid;

      await setDoc(doc(db, 'users', userId), {
        email: email,
        username: username,
        createdAt: new Date(),
        emailVerified: true,
        verifiedAt: new Date(),
      });

      await setDoc(doc(db, 'streaks', userId), {
        userId: userId,
        currentStreak: 0,
        longestStreak: 0,
        lastCheckDate: new Date(),
        startDate: new Date(),
        relapses: 0
      });

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
        return { success: false, error: 'EMAIL_NOT_VERIFIED', userId: userId, email: email };
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

  const resendVerificationEmail = async (email, password, username) => {
    try {
      const verificationCode = generateVerificationCode();
      await saveVerificationCode(email, password, username, verificationCode);
      
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
