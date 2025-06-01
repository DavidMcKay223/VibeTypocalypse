import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export const Factory: React.FC = () => {
  const { resources, updateResource, factoryLevel, productionMultiplier } = useGameStore();

  // Automatic resource production
  useEffect(() => {
    const productionInterval = setInterval(() => {
      resources.forEach(resource => {
        const production = resource.perSecond * productionMultiplier * factoryLevel;
        updateResource(resource.name, production);
      });
    }, 1000);

    return () => clearInterval(productionInterval);
  }, [resources, updateResource, factoryLevel, productionMultiplier]);

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Factory</h2>
      <div className="grid grid-cols-1 gap-4">
        {resources.map(resource => (
          <div key={resource.name} className="bg-gray-700 p-3 rounded">
            <div className="flex justify-between items-center">
              <span className="text-white">{resource.name}</span>
              <span className="text-green-400">{Math.floor(resource.amount)}</span>
            </div>
            <div className="text-sm text-gray-400">
              Production: {(resource.perSecond * productionMultiplier * factoryLevel).toFixed(1)}/s
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-gray-300">
        Factory Level: {factoryLevel}
      </div>
    </div>
  );
}; 