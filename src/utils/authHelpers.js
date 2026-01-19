export const validateUsername = (username) => {
  if (!username || username.length < 3) {
    return false;
  }
  if (username.length > 20) {
    return false;
  }
  return /^[a-zA-Z0-9_]+$/.test(username);
};

export const getAuthErrorMessage = (error) => {
  if (!error) return 'Bir hata oluştu';

  const errorString = String(error);

  // Google auth specific errors
  if (errorString.includes('popup_closed') || errorString.includes('dismiss')) {
    return 'Giriş penceresi kapatıldı.';
  }
  if (errorString.includes('cancelled')) {
    return 'Giriş iptal edildi.';
  }

  // General auth errors
  if (errorString.includes('network-request-failed') || errorString.includes('network')) {
    return 'İnternet bağlantısı hatası';
  }
  if (errorString.includes('too-many-requests')) {
    return 'Çok fazla deneme. Lütfen daha sonra tekrar deneyin';
  }
  if (errorString.includes('user-disabled')) {
    return 'Bu hesap devre dışı bırakılmış';
  }
  if (errorString.includes('account-exists-with-different-credential')) {
    return 'Bu email farklı bir giriş yöntemiyle kayıtlı';
  }

  return 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
};
