import React from 'react';

interface CircularProgressProps {
  progressPercent: number;
  size?: number;
  strokeWidth?: number;
  label?: React.ReactNode;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  progressPercent,
  size = 16,
  strokeWidth = 4.5,
  label,
  className = '',
}) => {
  const clampPercent = Math.min(100, Math.max(0, progressPercent));

  return (
    <div
      className={`relative flex items-center justify-center flex-shrink-0 text-accent-blue ${className}`}
      style={{ width: size, height: size }}
      title={`${clampPercent}% completed`}
    >
      <svg className="-rotate-90" style={{ width: size, height: size }} viewBox="0 0 36 36">
        <path
          className="text-vg-elevated"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <path
          className="text-accent-blue transition-all duration-300"
          strokeDasharray={`${clampPercent}, 100`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="none"
          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        />
      </svg>
      {label && <div className="absolute inset-0 flex items-center justify-center pointer-events-none">{label}</div>}
    </div>
  );
};
