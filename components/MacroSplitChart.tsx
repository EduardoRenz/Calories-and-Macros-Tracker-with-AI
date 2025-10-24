import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { DashboardData } from '../domain/entities/dashboard';

interface MacroSplitChartProps {
  data: DashboardData;
}

const COLORS = {
  protein: '#A076F9',
  carbs: '#F4A261',
  fats: '#E9C46A',
};

const MacroSplitChart: React.FC<MacroSplitChartProps> = ({ data }) => {
  const { protein, carbs, fats, calories } = data.macros;
  
  const totalMacros = protein.current + carbs.current + fats.current;

  const chartData = [
    { name: 'Protein', value: protein.current, color: COLORS.protein },
    { name: 'Carbs', value: carbs.current, color: COLORS.carbs },
    { name: 'Fats', value: fats.current, color: COLORS.fats },
  ];

  const getPercentage = (value: number) => {
    return totalMacros > 0 ? Math.round((value / totalMacros) * 100) : 0;
  }

  return (
    <div className="h-full w-full flex flex-col">
        <div className="relative w-full h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="70%"
                    outerRadius="100%"
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    cornerRadius={10}
                >
                    {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.color} />
                    ))}
                </Pie>
                </PieChart>
            </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-xs text-healthpal-text-secondary">Total Intake</p>
                <p className="text-3xl font-bold">{calories.current}</p>
                <p className="text-sm text-healthpal-text-secondary">kcal</p>
            </div>
        </div>

        <div className="mt-6 space-y-3">
            {chartData.map(item => (
                <div key={item.name} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <p>{item.name}</p>
                    </div>
                    <p className="font-bold">{getPercentage(item.value)}%</p>
                </div>
            ))}
        </div>
    </div>
  );
};

export default MacroSplitChart;