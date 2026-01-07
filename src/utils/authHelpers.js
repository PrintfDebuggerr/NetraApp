export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const getAuthErrorMessage = (error) => {
  if (!error) return 'Bir hata oluştu';
  
  const errorString = String(error);
  
  if (errorString.includes('email-already-in-use')) {
    return 'Bu email zaten kullanılıyor';
  }
  if (errorString.includes('invalid-email')) {
    return 'Geçersiz email adresi';
  }
  if (errorString.includes('weak-password')) {
    return 'Şifre en az 6 karakter olmalı';
  }
  if (errorString.includes('user-not-found')) {
    return 'Kullanıcı bulunamadı';
  }
  if (errorString.includes('wrong-password') || errorString.includes('invalid-credential')) {
    return 'Email veya şifre hatalı';
  }
  if (errorString.includes('too-many-requests')) {
    return 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin';
  }
  if (errorString.includes('network-request-failed')) {
    return 'İnternet bağlantısı hatası';
  }
  
  return errorString;
};
