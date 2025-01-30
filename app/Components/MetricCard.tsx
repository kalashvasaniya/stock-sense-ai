import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: IconType;
  change?: number;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, icon: Icon, change, color = "blue" }) => (
  <motion.div
    className={`bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-lg`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-xl font-bold mt-2 text-white">{value}</p>
        {change !== undefined && (
          <p className={`text-sm mt-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(2)}%
          </p>
        )}
      </div>
      <div className={`p-2 rounded-lg bg-${color}-500/20`}>
        <Icon className={`w-5 h-5 text-${color}-500`} />
      </div>
    </div>
  </motion.div>
);
