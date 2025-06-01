import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const Combat: React.FC = () => {
  const { 
    enemies, 
    wave, 
    autoAttackDamage, 
    spawnWave, 
    typingSpeed,
    updateResource,
    addExperience
  } = useGameStore();

  // Auto-battle system
  useEffect(() => {
    const combatInterval = setInterval(() => {
      if (enemies.length === 0) {
        spawnWave();
      } else {
        // Auto attack based on typing speed and auto attack damage
        const damage = autoAttackDamage * (1 + typingSpeed / 100);
        
        // Apply damage to first enemy
        const enemy = enemies[0];
        if (enemy) {
          enemy.health -= damage;
          
          // If enemy is defeated
          if (enemy.health <= 0) {
            // Remove enemy
            enemies.shift();
            
            // Grant rewards
            const baseReward = enemy.maxHealth * 0.1;
            updateResource('Scrap', Math.floor(baseReward));
            updateResource('Energy', Math.floor(baseReward * 0.5));
            addExperience(Math.floor(baseReward));
            
            // If wave cleared, spawn new wave
            if (enemies.length === 0) {
              spawnWave();
            }
          }
        }
      }
    }, 1000);

    return () => clearInterval(combatInterval);
  }, [enemies, autoAttackDamage, spawnWave, typingSpeed, updateResource, addExperience]);

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Wave Defense</h2>
      <div className="mb-4 text-gray-300">
        <div>Current Wave: {wave}</div>
        <div>Enemies Remaining: {enemies.length}</div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {enemies.slice(0, 3).map(enemy => (
          <div key={enemy.id} className="bg-gray-700 p-2 rounded">
            <div className="flex justify-between items-center">
              <span className="text-white">{enemy.type}</span>
              <span className="text-red-400">
                {Math.floor(enemy.health)}/{enemy.maxHealth}
              </span>
            </div>
            <div className="w-full bg-gray-600 h-2 rounded-full mt-1">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-200"
                style={{
                  width: `${Math.max(0, (enemy.health / enemy.maxHealth) * 100)}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-gray-400">
        <div>Auto Attack Damage: {autoAttackDamage.toFixed(1)}/s</div>
        <div>DPS Bonus from Typing: +{Math.floor(typingSpeed)}%</div>
      </div>
    </div>
  );
}; 