import React from 'react';
import { useGameStore, gunUpgrades } from '../store/gameStore';

export const GunShop: React.FC = () => {
  const { money, purchasedGuns, purchaseGun } = useGameStore();

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Armory</h2>
        <div className="text-yellow-400">💰 {money}</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gunUpgrades.map(gun => {
          const isPurchased = purchasedGuns.includes(gun.id);
          const canAfford = money >= gun.cost;

          return (
            <div
              key={gun.id}
              className={`bg-gray-700 p-4 rounded-lg ${
                isPurchased ? 'border-2 border-green-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{gun.name}</h3>
                <div className="text-yellow-400">💰 {gun.cost}</div>
              </div>
              <p className="text-gray-300 text-sm mb-3">{gun.description}</p>
              <button
                onClick={() => purchaseGun(gun.id)}
                disabled={isPurchased || !canAfford}
                className={`w-full py-2 px-4 rounded ${
                  isPurchased
                    ? 'bg-green-600 cursor-not-allowed'
                    : canAfford
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                {isPurchased ? 'Purchased' : canAfford ? 'Purchase' : 'Not enough money'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 