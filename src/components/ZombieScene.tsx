import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const ZombieScene: React.FC = () => {
  const { enemies, calculateAutoAttackDamage, damageEnemy } = useGameStore();

  // Handle manual clicks
  const handleClick = (enemyId: string) => {
    const damage = calculateAutoAttackDamage() * 2; // Manual clicks do double damage
    damageEnemy(enemyId, damage);
  };

  // Auto-attack system
  useEffect(() => {
    if (enemies.length === 0) return;

    const interval = setInterval(() => {
      const randomEnemyIndex = Math.floor(Math.random() * enemies.length);
      const randomEnemy = enemies[randomEnemyIndex];
      if (randomEnemy) {
        damageEnemy(randomEnemy.id, calculateAutoAttackDamage());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [enemies, calculateAutoAttackDamage, damageEnemy]);

  return (
    <div className="relative w-full h-[300px] bg-gray-900 rounded-lg overflow-hidden p-4">
      <div className="grid grid-cols-3 gap-4">
        {enemies.map(enemy => (
          <button
            key={enemy.id}
            onClick={() => handleClick(enemy.id)}
            className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <div className="text-center mb-2">Enemy #{enemy.id.split('-')[2]}</div>
            <div className="w-full bg-gray-900 rounded-full h-2 mb-2">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  enemy.health / enemy.maxHealth > 0.7 ? 'bg-green-500' :
                  enemy.health / enemy.maxHealth > 0.3 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${(enemy.health / enemy.maxHealth) * 100}%` }}
              />
            </div>
            <div className="text-center text-sm">
              {Math.ceil(enemy.health)} / {enemy.maxHealth} HP
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};