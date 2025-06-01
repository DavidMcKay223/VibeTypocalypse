import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const Combat: React.FC = () => {
  const { enemies, wave, autoAttackDamage, spawnWave, typingSpeed } = useGameStore();

  // Auto-battle system
  useEffect(() => {
    const combatInterval = setInterval(() => {
      if (enemies.length === 0) {
        spawnWave();
      } else {
        // Auto attack based on typing speed and auto attack damage
        const damage = autoAttackDamage * (1 + typingSpeed / 100);
        // Apply damage logic here
      }
    }, 1000);

    return () => clearInterval(combatInterval);
  }, [enemies, autoAttackDamage, spawnWave, typingSpeed]);

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Wave Defense</h2>
      <div className="mb-4 text-gray-300">
        Current Wave: {wave}
      </div>
      <div className="grid grid-cols-1 gap-2">
        {enemies.map(enemy => (
          <div key={enemy.id} className="bg-gray-700 p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="text-white">{enemy.type}</span>
              <span className="text-red-400">
                {Math.floor(enemy.health)}/{enemy.maxHealth}
              </span>
            </div>
            <div className="w-full bg-gray-600 h-2 rounded-full mt-1">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{
                  width: `${(enemy.health / enemy.maxHealth) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-gray-400">
        Auto Attack Damage: {autoAttackDamage}
      </div>
    </div>
  );
}; 