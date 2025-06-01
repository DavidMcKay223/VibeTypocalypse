import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { ZombieScene } from './ZombieScene';

export const Combat: React.FC = () => {
  const { wave, enemies, spawnWave } = useGameStore();
  const [countdown, setCountdown] = useState<number | null>(null);

  // Calculate wave stats
  const currentWaveStats = enemies.length > 0 ? {
    enemyCount: enemies.length,
    maxHealth: enemies[0].maxHealth,
    damage: enemies[0].damage,
    reward: enemies[0].reward
  } : null;

  // Auto spawn next wave when no enemies are present
  useEffect(() => {
    if (enemies.length === 0) {
      setCountdown(2);
      const timer = setTimeout(() => {
        spawnWave();
        setCountdown(null);
      }, 2000);

      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setCountdown(prev => prev !== null ? Math.max(0, prev - 1) : null);
      }, 1000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
  }, [enemies.length, spawnWave]);

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Combat Zone - Wave {wave}</h2>
        <div className="text-sm text-gray-400">
          {enemies.length === 0 
            ? countdown !== null 
              ? `Next wave in ${countdown}...` 
              : 'Spawning wave...'
            : `${enemies.length} enemies remaining`
          }
        </div>
      </div>

      {currentWaveStats && (
        <div className="grid grid-cols-3 gap-4 mb-4 p-2 bg-gray-700 rounded-lg text-sm">
          <div>
            <span className="text-gray-400">Enemy Health: </span>
            <span className="text-red-400">{Math.floor(currentWaveStats.maxHealth).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-400">Enemy Damage: </span>
            <span className="text-orange-400">{Math.floor(currentWaveStats.damage).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-gray-400">Reward: </span>
            <span className="text-yellow-400">💰 {Math.floor(currentWaveStats.reward).toLocaleString()}</span>
          </div>
        </div>
      )}

      <ZombieScene />
    </div>
  );
}; 