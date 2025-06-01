import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAchievementStore } from '../store/achievementStore';

export const Factory: React.FC = () => {
  const { 
    resources, 
    updateResource, 
    factories,
    upgradeFactory,
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

  // Calculate upgrade cost for a factory
  const getUpgradeCost = (factory: any) => {
    return factory.baseCost.amount * (factory.level + 1);
  };

  // Check if player can afford upgrade
  const canAffordUpgrade = (factory: any) => {
    const cost = getUpgradeCost(factory);
    const resource = resources.find(r => r.name === factory.baseCost.resource);
    return resource && resource.amount >= cost;
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Factories</h2>
      
      {/* Resource Display */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {resources.map(resource => (
          <div key={resource.name} className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between items-center">
              <span className="text-white">{resource.name}</span>
              <span className="text-green-400">{Math.floor(resource.amount)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Factories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {factories.map(factory => (
          <div 
            key={factory.id}
            className={`bg-gray-700 p-4 rounded-lg ${
              !factory.unlocked ? 'opacity-75' : ''
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">{factory.name}</h3>
              {factory.unlocked ? (
                <div className="flex items-center">
                  <span className="text-green-400 mr-2">Level {factory.level}</span>
                  <button
                    onClick={() => toggleFactory(factory.id)}
                    className={`px-2 py-1 rounded ${
                      factory.active
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {factory.active ? 'On' : 'Off'}
                  </button>
                </div>
              ) : (
                <span className="text-yellow-500">
                  Unlocks at level {factory.unlockLevel}
                </span>
              )}
            </div>
            
            <p className="text-gray-300 text-sm mb-3">{factory.description}</p>
            
            {/* Effects Display */}
            <div className="space-y-1 mb-3">
              {Object.entries(factory.effects).map(([effect, value]) => (
                <div key={effect} className="text-sm">
                  {effect === 'scrapProduction' && (
                    <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>
                      Scrap: {value > 0 ? '+' : ''}{value * factory.level}/s
                    </span>
                  )}
                  {effect === 'energyProduction' && (
                    <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>
                      Energy: {value > 0 ? '+' : ''}{value * factory.level}/s
                    </span>
                  )}
                  {effect === 'typingDamageBonus' && (
                    <span className="text-blue-400">
                      Typing Damage: +{(value * factory.level * 100).toFixed(0)}%
                    </span>
                  )}
                  {effect === 'autoAttackBonus' && (
                    <span className="text-purple-400">
                      Auto Attack: +{(value * factory.level * 100).toFixed(0)}%
                    </span>
                  )}
                  {effect === 'experienceBonus' && (
                    <span className="text-yellow-400">
                      Experience: +{(value * factory.level * 100).toFixed(0)}%
                    </span>
                  )}
                  {effect === 'resourceBonus' && (
                    <span className="text-orange-400">
                      Resources: +{(value * factory.level * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Upgrade Button */}
            {factory.unlocked && (
              <button
                onClick={() => canAffordUpgrade(factory) && upgradeFactory(factory.id)}
                className={`w-full py-2 px-4 rounded ${
                  canAffordUpgrade(factory)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
                disabled={!canAffordUpgrade(factory)}
              >
                Upgrade ({getUpgradeCost(factory)} {factory.baseCost.resource})
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 