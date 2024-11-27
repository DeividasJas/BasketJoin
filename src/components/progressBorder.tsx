import { motion } from 'framer-motion';

export default function ProgressBorder({
  children,
  progress,
}: {
  progress: number;
  children: React.ReactNode;
}) {
  const size = 67;
  const thickness = 2.5;
  const color = '#71717a';
  const trailColor = '#d6d6d6';
  const duration = 1.1;

  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;
  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: 'rotate(-90deg)',
          position: 'absolute',
          inset: 0,
        }}
      >
        {/* Background trail */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trailColor}
          strokeWidth={thickness}
          fill='transparent'
        />

        {/* Animated border */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          fill='transparent'
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration }}
          style={{
            strokeLinecap: 'round', // Makes the border ends rounded
          }}
        />
      </svg>

      {/* Inner content */}

      {children}
    </div>
  );
}
