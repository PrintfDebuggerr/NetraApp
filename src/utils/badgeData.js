// Badge data ve helper fonksiyonlar
export const badges = [
  {
    id: 1,
    title: '1 Day',
    tier: 'Bronze',
    icon: 'flame',
    requiredDays: 1,
    unlocked: true,
    colors: ['#CD7F32', '#dca873', '#8B4513'],
    iconColor: '#CD7F32',
    bgColor: '#2a1d15',
    tierColor: '#CD7F32',
  },
  {
    id: 2,
    title: '1 Week',
    tier: 'Silver',
    icon: 'shield-checkmark',
    requiredDays: 7,
    unlocked: true,
    colors: ['#E0E0E0', '#F5F5F5', '#757575'],
    iconColor: '#E0E0E0',
    bgColor: '#1a1a1a',
    tierColor: '#9ca3af',
  },
  {
    id: 3,
    title: '30 Days',
    tier: 'Cyan',
    icon: 'water',
    requiredDays: 30,
    unlocked: true,
    colors: ['#0df2a6', '#67e8f9', '#0284c7'],
    iconColor: '#0df2a6',
    bgColor: '#0a2e36',
    tierColor: '#0df2a6',
    glow: true,
  },
  {
    id: 4,
    title: 'Master',
    tier: 'Rainbow',
    icon: 'sparkles',
    requiredDays: 60,
    unlocked: true,
    colors: ['#ec4899', '#facc15', '#06b6d4'],
    iconColor: '#fff',
    bgColor: '#1f1f1f',
    tierColor: 'rainbow',
    special: true,
  },
  {
    id: 5,
    title: 'First Step',
    tier: 'Gold',
    icon: 'trophy',
    requiredDays: 1,
    unlocked: true,
    colors: ['#FFD700', '#fffacd', '#B8860B'],
    iconColor: '#FFD700',
    bgColor: '#2e2505',
    tierColor: '#FFD700',
  },
  {
    id: 6,
    title: 'Focus',
    tier: 'Purple',
    icon: 'brain',
    iconType: 'material',
    requiredDays: 14,
    unlocked: true,
    colors: ['#a855f7', '#d8b4fe', '#4338ca'],
    iconColor: '#c084fc',
    bgColor: '#1e102e',
    tierColor: '#c084fc',
  },
  {
    id: 7,
    title: 'Pure',
    tier: 'Bright',
    icon: 'diamond',
    requiredDays: 45,
    unlocked: true,
    colors: ['#ffffff', '#e5e7eb', '#9ca3af'],
    iconColor: '#fff',
    bgColor: '#202529',
    tierColor: '#fff',
  },
  {
    id: 8,
    title: 'Loved',
    tier: 'Heart',
    icon: 'heart',
    requiredDays: 21,
    unlocked: true,
    colors: ['#ec4899', '#f9a8d4', '#7c3aed'],
    iconColor: '#f472b6',
    bgColor: '#2e1020',
    tierColor: '#f472b6',
  },
  {
    id: 9,
    title: '90 Days',
    tier: 'Locked',
    icon: 'lock-closed',
    requiredDays: 90,
    unlocked: false,
  },
  {
    id: 10,
    title: '6 Months',
    tier: 'Locked',
    icon: 'lock-closed',
    requiredDays: 180,
    unlocked: false,
  },
  {
    id: 11,
    title: '1 Year',
    tier: 'Locked',
    icon: 'lock-closed',
    requiredDays: 365,
    unlocked: false,
  },
];

// Kullanıcının streak'ine göre en yüksek kazanılan badge'i döndür
export const getCurrentBadge = (streakDays) => {
  // Kazanılan badge'leri filtrele ve en yüksek olanı bul
  const unlockedBadges = badges.filter(
    badge => badge.unlocked && badge.requiredDays <= streakDays
  );
  
  if (unlockedBadges.length === 0) {
    // Hiç badge kazanılmamışsa varsayılan medal
    return {
      icon: 'medal',
      iconType: 'material',
      iconColor: '#9ca3af',
      colors: ['#4b5563', '#6b7280', '#9ca3af'],
      bgColor: '#1f2937',
    };
  }
  
  // En yüksek requiredDays'e sahip badge'i bul
  return unlockedBadges.reduce((highest, current) => 
    current.requiredDays > highest.requiredDays ? current : highest
  );
};
