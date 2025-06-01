import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAchievementStore } from '../store/achievementStore';

export const Factory: React.FC = () => {
  const { 
    resources, 
    updateResource, 
    factories,
    upgradeFactory,
    unlockFactory,
    toggleFactory,
    level: playerLevel
  } = useGameStore();
  const { updateProgress } = useAchievementStore();

  // Automatic resource production
  useEffect(() => {
    const productionInterval = setInterval(() => {
      // Calculate total production for each resource
      const totalProduction = {
        Scrap: 0,
        Energy: 0
      };

      // Sum up production from all active factories
      factories.forEach(factory => {
        if (factory.active && factory.level > 0) {
          if (factory.effects.scrapProduction) {
            totalProduction.Scrap += factory.effects.scrapProduction * factory.level;
          }
          if (factory.effects.energyProduction) {
            totalProduction.Energy += factory.effects.energyProduction * factory.level;
          }
        }
      });

      // Update resources
      Object.entries(totalProduction).forEach(([resource, amount]) => {
        if (amount !== 0) {
          updateResource(resource, amount);
        }
      });
    }, 1000);

    return () => clearInterval(productionInterval);
  }, [factories, updateResource]);

  // Track factory achievements
  useEffect(() => {
    // Count active factories
    const activeFactories = factories.filter(f => f.active).length;
    updateProgress('factories-3', activeFactories);

    // Check for level 5 factory
    const hasLevel5Factory = factories.some(f => f.level >= 5);
    if (hasLevel5Factory) {
      updateProgress('factory-level-5', 5);
    }
  }, [factories, updateProgress]);

  const handleUpgrade = (factoryId: string) => {
    upgradeFactory(factoryId);
    // Track factory upgrades achievement
    const factory = factories.find(f => f.id === factoryId);
    if (factory) {
      updateProgress('factory-master', factory.level + 1);
    }
  };

  const handleUnlock = (factoryId: string) => {
    unlockFactory(factoryId);
    // Track factory unlocks achievement
    updateProgress('factories-3', factories.filter(f => f.unlocked).length + 1);
  };

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Factory Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {factories.map(factory => {
          const canUnlock = !factory.unlocked && playerLevel >= factory.unlockLevel;
          const resource = factory.baseCost?.resource 
            ? resources.find(r => r.name === factory.baseCost.resource)
            : null;

          // Calculate costs
          const unlockCost = factory.baseCost?.amount || 0;
          const upgradeCost = factory.baseCost?.amount 
            ? factory.baseCost.amount * (factory.level + 1)
            : 0;

          // Check if player can afford
          const canAffordUnlock = resource && resource.amount >= unlockCost;
          const canAffordUpgrade = resource && resource.amount >= upgradeCost;

          return (
            <div
              key={factory.id}
              className={`bg-gray-700 p-4 rounded-lg ${
                !factory.unlocked && !canUnlock ? 'opacity-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-white">
                  {factory.name}
                  {factory.unlocked && (
                    <span className="text-sm font-normal text-gray-400 ml-2">
                      Level {factory.level}
                    </span>
                  )}
                </h3>
                {factory.unlocked && (
                  <button
                    onClick={() => toggleFactory(factory.id)}
                    className={`px-2 py-1 rounded ${
                      factory.active
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {factory.active ? 'Active' : 'Inactive'}
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-300 mb-3">{factory.description}</p>

              <div className="text-sm text-gray-400 mb-3">
                {factory.effects?.scrapProduction && (
                  <div>Scrap: {factory.effects.scrapProduction > 0 ? '+' : ''}{factory.effects.scrapProduction * (factory.level || 1)}/s</div>
                )}
                {factory.effects?.energyProduction && (
                  <div>Energy: {factory.effects.energyProduction > 0 ? '+' : ''}{factory.effects.energyProduction * (factory.level || 1)}/s</div>
                )}
                {factory.effects?.typingDamageBonus && (
                  <div>
                    Typing Damage: +{Math.floor(factory.effects.typingDamageBonus * (factory.level || 1) * 100)}%
                  </div>
                )}
                {factory.effects?.autoAttackBonus && (
                  <div>
                    Auto Attack: +{Math.floor(factory.effects.autoAttackBonus * (factory.level || 1) * 100)}%
                  </div>
                )}
                {factory.effects?.experienceBonus && (
                  <div>
                    Experience: +{Math.floor(factory.effects.experienceBonus * (factory.level || 1) * 100)}%
                  </div>
                )}
                {factory.effects?.resourceBonus && (
                  <div>
                    All Resources: +{Math.floor(factory.effects.resourceBonus * (factory.level || 1) * 100)}%
                  </div>
                )}
              </div>

              {!factory.unlocked ? (
                playerLevel < factory.unlockLevel ? (
                  <div className="text-sm text-gray-400">
                    Unlocks at level {factory.unlockLevel}
                  </div>
                ) : (
                  <button
                    onClick={() => handleUnlock(factory.id)}
                    disabled={!canAffordUnlock}
                    className={`w-full py-2 px-4 rounded font-semibold ${
                      canAffordUnlock
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {canAffordUnlock ? (
                      <>
                        Unlock ({factory.baseCost?.resource}: {Math.floor(unlockCost).toLocaleString()})
                      </>
                    ) : (
                      'Not enough resources'
                    )}
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleUpgrade(factory.id)}
                  disabled={!canAffordUpgrade}
                  className={`w-full py-2 px-4 rounded font-semibold ${
                    canAffordUpgrade
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-600 cursor-not-allowed'
                  }`}
                >
                  {canAffordUpgrade ? (
                    <>
                      Upgrade ({factory.baseCost?.resource}: {Math.floor(upgradeCost).toLocaleString()})
                    </>
                  ) : (
                    'Not enough resources'
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}; 