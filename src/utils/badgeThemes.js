// ─── Badge Visual Theme System ────────────────────────────────────────────────
// Single source of truth for all badge colors.
// Components read from here — never hardcode badge colors in JSX.

/** @typedef {{ iconColor: string, innerBg: string, ringColor: string, outerGlow: string }} BadgeTheme */

/** @type {Record<number, BadgeTheme>} */
export const BADGE_THEMES = {
  1: {
    iconColor: '#34D399',
    innerBg:   '#052e2b',
    ringColor: '#6ee7b7',
    outerGlow: 'rgba(52,211,153,0.18)',
  },
  2: {
    iconColor: '#fb923c',
    innerBg:   '#3a1d08',
    ringColor: '#fdba74',
    outerGlow: 'rgba(251,146,60,0.20)',
  },
  3: {
    iconColor: '#60a5fa',
    innerBg:   '#0b1f3a',
    ringColor: '#93c5fd',
    outerGlow: 'rgba(96,165,250,0.18)',
  },
  4: {
    iconColor: '#a78bfa',
    innerBg:   '#24123f',
    ringColor: '#c4b5fd',
    outerGlow: 'rgba(167,139,250,0.20)',
  },
  5: {
    iconColor: '#8b5cf6',
    innerBg:   '#1f1147',
    ringColor: '#a78bfa',
    outerGlow: 'rgba(139,92,246,0.22)',
  },
  6: {
    iconColor: '#f87171',
    innerBg:   '#3b0d12',
    ringColor: '#fca5a5',
    outerGlow: 'rgba(248,113,113,0.20)',
  },
  7: {
    iconColor: '#f472b6',
    innerBg:   '#3b1028',
    ringColor: '#f9a8d4',
    outerGlow: 'rgba(244,114,182,0.20)',
  },
  8: {
    iconColor: '#facc15',
    innerBg:   '#3a2a05',
    ringColor: '#fde047',
    outerGlow: 'rgba(250,204,21,0.22)',
  },
  9: {
    iconColor: '#e5e7eb',
    innerBg:   '#1f2937',
    ringColor: '#ffffff',
    outerGlow: 'rgba(255,255,255,0.22)',
  },
  10: {
    iconColor: '#facc15',
    innerBg:   '#2a1240',
    ringColor: '#d8b4fe',
    outerGlow: 'rgba(168,85,247,0.24)',
  },
};

/** Theme applied to every locked badge — monochrome, no glow */
export const LOCKED_THEME = {
  iconColor: '#1e2a3a',
  innerBg:   '#080c14',
  ringColor: '#141d2e',
  outerGlow: 'rgba(0,0,0,0)',
};

/**
 * Resolves the visual theme for a badge.
 * @param {number} badgeId
 * @param {boolean} isEarned
 * @returns {BadgeTheme}
 */
export const getBadgeTheme = (badgeId, isEarned) =>
  isEarned ? (BADGE_THEMES[badgeId] ?? LOCKED_THEME) : LOCKED_THEME;
