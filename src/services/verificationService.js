import { doc, setDoc, getDoc, updateDoc, deleteDoc, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const VERIFICATION_COLLECTION = 'emailVerifications';
const CODE_EXPIRY_MINUTES = 5;

export const checkEmailExists = async (email) => {
  try {
    // Users collection'da kontrol et
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return { success: true, exists: true, location: 'users' };
    }
    
    // EmailVerifications collection'da kontrol et (eski kayıt var mı?)
    const verificationDoc = await getDoc(doc(db, VERIFICATION_COLLECTION, email));
    if (verificationDoc.exists()) {
      const data = verificationDoc.data();
      const now = new Date();
      const expiresAt = data.expiresAt.toDate();
      
      // Süresi dolmuşsa sil ve devam et
      if (now > expiresAt) {
        await deleteDoc(doc(db, VERIFICATION_COLLECTION, email));
        return { success: true, exists: false };
      }
      
      return { success: true, exists: true, location: 'verification' };
    }
    
    return { success: true, exists: false };
  } catch (error) {
    console.error('Check Email Exists Error:', error);
    return { success: false, error: error.message };
  }
};

export const saveVerificationCode = async (email, password, username, code) => {
  try {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + CODE_EXPIRY_MINUTES);

    await setDoc(doc(db, VERIFICATION_COLLECTION, email), {
      email,
      password,
      username,
      code,
      createdAt: new Date(),
      expiresAt: expiryTime,
      verified: false,
      attempts: 0,
    });

    return { success: true };
  } catch (error) {
    console.error('Save Verification Code Error:', error);
    return { success: false, error: error.message };
  }
};

export const verifyCode = async (email, inputCode) => {
  try {
    const verificationDoc = await getDoc(doc(db, VERIFICATION_COLLECTION, email));

    if (!verificationDoc.exists()) {
      return { success: false, error: 'Doğrulama kodu bulunamadı' };
    }

    const data = verificationDoc.data();

    if (data.verified) {
      return { success: false, error: 'Bu email zaten doğrulanmış' };
    }

    const now = new Date();
    const expiresAt = data.expiresAt.toDate();

    if (now > expiresAt) {
      return { success: false, error: 'Doğrulama kodu süresi dolmuş. Lütfen yeni kod isteyin.' };
    }

    if (data.attempts >= 3) {
      return { success: false, error: 'Çok fazla hatalı deneme. Lütfen yeni kod isteyin.' };
    }

    if (data.code !== inputCode) {
      await updateDoc(doc(db, VERIFICATION_COLLECTION, email), {
        attempts: data.attempts + 1,
      });
      return { success: false, error: `Hatalı kod. Kalan deneme: ${2 - data.attempts}` };
    }

    await updateDoc(doc(db, VERIFICATION_COLLECTION, email), {
      verified: true,
      verifiedAt: new Date(),
    });

    return { 
      success: true, 
      data: {
        email: data.email,
        password: data.password,
        username: data.username
      }
    };
  } catch (error) {
    console.error('Verify Code Error:', error);
    return { success: false, error: error.message };
  }
};

export const isEmailVerified = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: true, verified: false };
    }

    const userData = userDoc.data();
    return { success: true, verified: userData.emailVerified || false };
  } catch (error) {
    console.error('Check Email Verified Error:', error);
    return { success: false, error: error.message };
  }
};

export const deleteVerificationCode = async (email) => {
  try {
    await deleteDoc(doc(db, VERIFICATION_COLLECTION, email));
    return { success: true };
  } catch (error) {
    console.error('Delete Verification Code Error:', error);
    return { success: false, error: error.message };
  }
};

export const getVerificationData = async (email) => {
  try {
    const verificationDoc = await getDoc(doc(db, VERIFICATION_COLLECTION, email));
    
    if (!verificationDoc.exists()) {
      return { success: false, error: 'Doğrulama verisi bulunamadı' };
    }

    return { success: true, data: verificationDoc.data() };
  } catch (error) {
    console.error('Get Verification Data Error:', error);
    return { success: false, error: error.message };
  }
};
