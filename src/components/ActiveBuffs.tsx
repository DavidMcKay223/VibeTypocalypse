import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

export const ActiveBuffs: React.FC = () => {
  const { activeBuffs } = useGameStore();
  const [, forceUpdate] = useState({});

  // Force update every second to update remaining time
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (activeBuffs.length === 0) return null;

  const now = Date.now();
  const activeBuffsList = activeBuffs.filter(buff => buff.endTime > now);

  if (activeBuffsList.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 bg-gray-900 p-4 rounded-lg shadow-lg border border-gray-700 w-64">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <span className="mr-2">✨</span>
        Active Buffs
      </h3>
      <div className="space-y-2">
        {activeBuffsList.map(buff => {
          const remainingTime = Math.max(0, Math.floor((buff.endTime - now) / 1000));
          const minutes = Math.floor(remainingTime / 60);
          const seconds = remainingTime % 60;

          let icon = '✨';
          let color = 'text-yellow-400';
          switch (buff.type) {
            case 'damage':
              icon = '⚔️';
              color = 'text-red-400';
              break;
            case 'resource':
              icon = '📦';
              color = 'text-blue-400';
              break;
            case 'experience':
              icon = '📚';
              color = 'text-green-400';
              break;
            case 'money':
              icon = '💰';
              color = 'text-yellow-400';
              break;
          }

          return (
            <div
              key={buff.id}
              className="bg-gray-800 p-3 rounded-lg flex items-center space-x-3"
            >
              <div className="text-2xl">{icon}</div>
              <div className="flex-1">
                <div className={`text-sm font-semibold ${color}`}>
                  {buff.type.charAt(0).toUpperCase() + buff.type.slice(1)} x{buff.multiplier}
                </div>
                <div className="text-xs text-gray-400">
                  {minutes}:{seconds.toString().padStart(2, '0')} remaining
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 