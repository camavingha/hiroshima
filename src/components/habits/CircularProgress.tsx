interface CircularProgressProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'purple' | 'blue' | 'green' | 'orange';
}

export default function CircularProgress({ progress, size = 'md', color = 'purple' }: CircularProgressProps) {
  const sizeMap = {
    sm: { radius: 35, circumference: 2 * Math.PI * 35 },
    md: { radius: 45, circumference: 2 * Math.PI * 45 },
    lg: { radius: 60, circumference: 2 * Math.PI * 60 },
  };

  const { radius, circumference } = sizeMap[size];
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colorClasses: Record<'purple' | 'blue' | 'green' | 'orange', string> = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
  };

  const sizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  const textSizeClasses: Record<'sm' | 'md' | 'lg', string> = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]}`}>
      <div className="relative">
        <svg
          className={`${sizeClasses[size]} -rotate-90`}
          viewBox={`0 0 ${radius * 2 + 20} ${radius * 2 + 20}`}
        >
          {/* Background circle */}
          <circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="3"
          />
          {/* Progress circle */}
          <circle
            cx={radius + 10}
            cy={radius + 10}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`transition-all duration-500 ${colorClasses[color]}`}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className={`font-bold ${textSizeClasses[size]} ${colorClasses[color]}`}>
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
