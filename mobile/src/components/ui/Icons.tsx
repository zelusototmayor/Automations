import React from 'react';
import Svg, { Path, Circle, Polyline, Rect, Polygon, Line, G } from 'react-native-svg';

// ═══════════════════════════════════════════════════════════════════════════
// PREMIUM ICON LIBRARY - Feather-style SVG icons
// ═══════════════════════════════════════════════════════════════════════════

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const defaultProps: IconProps = {
  size: 24,
  color: '#111827', // Spec primary text
  strokeWidth: 1.5,
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION ICONS
// ═══════════════════════════════════════════════════════════════════════════

export const HomeIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="9,22 9,12 15,12 15,22"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SearchIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="11" cy="11" r="8" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M21 21l-4.35-4.35"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MessageIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UserIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const PlusIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// ACTION ICONS
// ═══════════════════════════════════════════════════════════════════════════

export const ChevronLeftIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="15,18 9,12 15,6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChevronRightIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="9,6 15,12 9,18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const XIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const CheckIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="20,6 9,17 4,12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SendIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 2l-7 20-4-9-9-4 20-7z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// STATUS ICONS
// ═══════════════════════════════════════════════════════════════════════════

export const StarIcon = ({ size = 24, color = '#E5B94E', strokeWidth = 1.5, filled = false }: IconProps & { filled?: boolean }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : 'none'}>
    <Polygon
      points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const VerifiedIcon = ({ size = 24, color = '#6F8F79', backgroundColor }: IconProps & { backgroundColor?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" fill={backgroundColor || color} />
    <Polyline
      points="8,12 11,15 16,9"
      stroke="white"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SparkleIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// PROFILE & SETTINGS ICONS
// ═══════════════════════════════════════════════════════════════════════════

export const SettingsIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BellIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.73 21a2 2 0 01-3.46 0"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LockIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M7 11V7a5 5 0 0110 0v4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CreditCardIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="1" y1="10" x2="23" y2="10" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const HelpCircleIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const MailIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="22,6 12,13 2,6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const FileTextIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="14,2 14,8 20,8"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="16" y1="13" x2="8" y2="13" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="16" y1="17" x2="8" y2="17" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Polyline
      points="10,9 9,9 8,9"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const LogOutIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="16,17 21,12 16,7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// CATEGORY ICONS
// ═══════════════════════════════════════════════════════════════════════════

export const TargetIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth={strokeWidth} />
    <Circle cx="12" cy="12" r="2" stroke={color} strokeWidth={strokeWidth} />
  </Svg>
);

export const TrendingUpIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="23,6 13.5,15.5 8.5,10.5 1,18"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="17,6 23,6 23,12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HeartIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BriefcaseIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BookOpenIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const DollarSignIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Line x1="12" y1="1" x2="12" y2="23" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Path
      d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ZapIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polygon
      points="13,2 3,14 12,14 11,22 21,10 12,10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ActivityIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="22,12 18,12 15,21 9,3 6,12 2,12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const AwardIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="8" r="7" stroke={color} strokeWidth={strokeWidth} />
    <Polyline
      points="8.21,13.89 7,23 12,20 17,23 15.79,13.88"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CompassIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <Polygon
      points="16.24,7.76 14.12,14.12 7.76,16.24 9.88,9.88"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// CREATOR FLOW ICONS
// ═══════════════════════════════════════════════════════════════════════════

export const BrainIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5a3 3 0 103 3"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M12 5a7 7 0 017 7c0 1.5-.5 3-1.5 4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M12 5a7 7 0 00-7 7c0 1.5.5 3 1.5 4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M6.5 16c-.5 1-1 2-1 3 0 1.5 1 2 2 2s2-.5 2-2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Path
      d="M17.5 16c.5 1 1 2 1 3 0 1.5-1 2-2 2s-2-.5-2-2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
    <Line x1="12" y1="5" x2="12" y2="21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

export const LightbulbIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18h6"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 22h4"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M15.09 14c.18-.98.65-1.74 1.41-2.5A5.5 5.5 0 0012 2a5.5 5.5 0 00-4.5 9.5c.76.76 1.23 1.52 1.41 2.5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const RocketIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11.95A22 22 0 0112 15z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const GiftIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="20,12 20,22 4,22 4,12"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Rect x="2" y="7" width="20" height="5" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="22" x2="12" y2="7" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const RefreshIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Polyline
      points="23,4 23,10 17,10"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Polyline
      points="1,20 1,14 7,14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PencilIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// MISC ICONS
// ═══════════════════════════════════════════════════════════════════════════

export const ClockIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <Polyline
      points="12,6 12,12 16,14"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const UsersIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="9" cy="7" r="4" stroke={color} strokeWidth={strokeWidth} />
    <Path
      d="M23 21v-2a4 4 0 00-3-3.87"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M16 3.13a4 4 0 010 7.75"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const InfoIcon = ({ size = 24, color = '#111827', strokeWidth = 1.5 }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
    <Line x1="12" y1="16" x2="12" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    <Line x1="12" y1="8" x2="12.01" y2="8" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
  </Svg>
);

// ═══════════════════════════════════════════════════════════════════════════
// EXPORT ALL ICONS
// ═══════════════════════════════════════════════════════════════════════════

export const Icons = {
  // Navigation
  Home: HomeIcon,
  Search: SearchIcon,
  Message: MessageIcon,
  User: UserIcon,
  Plus: PlusIcon,

  // Actions
  ChevronLeft: ChevronLeftIcon,
  ChevronRight: ChevronRightIcon,
  X: XIcon,
  Check: CheckIcon,
  Send: SendIcon,

  // Status
  Star: StarIcon,
  Verified: VerifiedIcon,
  Sparkle: SparkleIcon,

  // Profile & Settings
  Settings: SettingsIcon,
  Bell: BellIcon,
  Lock: LockIcon,
  CreditCard: CreditCardIcon,
  HelpCircle: HelpCircleIcon,
  Mail: MailIcon,
  FileText: FileTextIcon,
  LogOut: LogOutIcon,

  // Categories
  Target: TargetIcon,
  TrendingUp: TrendingUpIcon,
  Heart: HeartIcon,
  Briefcase: BriefcaseIcon,
  BookOpen: BookOpenIcon,
  DollarSign: DollarSignIcon,
  Zap: ZapIcon,
  Activity: ActivityIcon,
  Award: AwardIcon,
  Compass: CompassIcon,

  // Creator Flow
  Brain: BrainIcon,
  Lightbulb: LightbulbIcon,
  Rocket: RocketIcon,
  Gift: GiftIcon,
  Refresh: RefreshIcon,
  Pencil: PencilIcon,

  // Misc
  Clock: ClockIcon,
  Users: UsersIcon,
  Info: InfoIcon,
};

export default Icons;
