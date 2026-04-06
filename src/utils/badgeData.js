// Badge config — sorted by requiredDays ascending.
// Visual colors live in badgeThemes.js, not here.
// Unlock state is computed dynamically: isEarned = streakDays >= badge.requiredDays

export const BADGES = [
  {
    id: 1,
    name: 'Başlangıç',
    description: 'Yolculuğuna başladın.',
    requiredDays: 0,
    icon: 'leaf-outline',
    iconType: 'ionicon',
  },
  {
    id: 2,
    name: 'Kıvılcım',
    description: 'İlk gün tamamlandı.',
    requiredDays: 1,
    icon: 'flame',
    iconType: 'ionicon',
  },
  {
    id: 3,
    name: 'Kontrol',
    description: '3 gün boyunca kontrolü korudun.',
    requiredDays: 3,
    icon: 'hand-left',
    iconType: 'ionicon',
  },
  {
    id: 4,
    name: 'İrade',
    description: 'Bir hafta geçti. İrade kazandın.',
    requiredDays: 7,
    icon: 'shield-checkmark',
    iconType: 'ionicon',
  },
  {
    id: 5,
    name: 'Disiplin',
    description: '2 hafta — alışkanlık oluşuyor.',
    requiredDays: 14,
    icon: 'barbell',
    iconType: 'ionicon',
  },
  {
    id: 6,
    name: 'Güçlenme',
    description: '21 gün — zihin güçlendi.',
    requiredDays: 21,
    icon: 'trending-up',
    iconType: 'ionicon',
  },
  {
    id: 7,
    name: 'Dönüşüm',
    description: '30 gün — gerçek bir dönüşüm.',
    requiredDays: 30,
    icon: 'sparkles',
    iconType: 'ionicon',
  },
  {
    id: 8,
    name: 'Ustalık',
    description: '60 gün — usta seviyesine ulaştın.',
    requiredDays: 60,
    icon: 'star',
    iconType: 'ionicon',
  },
  {
    id: 9,
    name: 'Zirve',
    description: '90 gün — beyin tamamen yenilendi.',
    requiredDays: 90,
    icon: 'trophy',
    iconType: 'ionicon',
  },
  {
    id: 10,
    name: 'Efsane',
    description: '180+ gün — efsane statüsü.',
    requiredDays: 180,
    icon: 'infinite',
    iconType: 'ionicon',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Highest earned badge. Always returns at least Başlangıç (0 days). */
export const getCurrentBadge = (streakDays = 0) => {
  const earned = BADGES.filter((b) => b.requiredDays <= streakDays);
  return earned[earned.length - 1] ?? BADGES[0];
};

/** Next badge to unlock, or null if all earned. */
export const getNextBadge = (streakDays = 0) =>
  BADGES.find((b) => b.requiredDays > streakDays) ?? null;

/** Days until next badge unlock, or 0 if all earned. */
export const getDaysToNextBadge = (streakDays = 0) => {
  const next = getNextBadge(streakDays);
  return next ? Math.max(0, next.requiredDays - streakDays) : 0;
};

// Legacy alias — existing `import { badges }` still works
export const badges = BADGES;
