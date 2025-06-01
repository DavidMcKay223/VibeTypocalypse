import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const ZombieScene: React.FC = () => {
  const { enemies, calculateAutoAttackDamage, damageEnemy } = useGameStore();

  // Handle manual clicks
  const handleClick = (enemyId: string) => {
    const damage = calculateAutoAttackDamage() * 2; // Manual clicks do double damage
    damageEnemy(enemyId, damage, 3); // Hit 3 enemies at once
  };

  // Auto-attack system
  useEffect(() => {
    if (enemies.length === 0) return;

    const interval = setInterval(() => {
      if (enemies.length > 0) {
        const randomEnemyIndex = Math.floor(Math.random() * enemies.length);
        const randomEnemy = enemies[randomEnemyIndex];
        if (randomEnemy) {
          damageEnemy(randomEnemy.id, calculateAutoAttackDamage(), 3); // Hit 3 enemies at once
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [enemies, calculateAutoAttackDamage, damageEnemy]);

  return (
    <div className="relative w-full h-[300px] bg-gray-900 rounded-lg overflow-hidden p-4">
      <div className="grid grid-cols-3 gap-4">
        {enemies.map((enemy, index) => (
          <button
            key={enemy.id}
            onClick={() => handleClick(enemy.id)}
            className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-colors relative group"
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
              {Math.ceil(enemy.health).toLocaleString()} / {enemy.maxHealth.toLocaleString()} HP
            </div>
            {/* Tooltip showing splash damage info */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Click to deal splash damage to nearby enemies
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};