
import React from 'react';

interface MacroProgressCardProps {
  title: string;
  current: number;
  goal: number;
  unit: string;
  color: string;
}

const MacroProgressCard: React.FC<MacroProgressCardProps> = ({ title, current, goal, unit, color }) => {
  const percentage = goal > 0 ? (current / goal) * 100 : 0;

  return (
    <div className="bg-healthpal-card p-6 rounded-2xl">
      <div className="flex justify-between items-baseline mb-3">
        <h3 className="font-bold text-healthpal-text-primary">{title}</h3>
        <p className="text-sm text-healthpal-text-secondary">
          <span className="font-semibold text-healthpal-text-primary">{current}</span> / {goal} {unit}
        </p>
      </div>
      <div className="w-full bg-healthpal-panel h-2.5 rounded-full">
        <div
          className={`${color} h-2.5 rounded-full`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default MacroProgressCard;
