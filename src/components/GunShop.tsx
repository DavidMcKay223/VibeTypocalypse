import React from 'react';
import { useGameStore, gunUpgrades, Gun } from '../store/gameStore';

export const GunShop: React.FC = () => {
  const { money, purchasedGuns, purchaseGun } = useGameStore();

  return (
    <div className="bg-gray-800 p-4 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">
        Gun Shop
        <span className="text-sm font-normal text-gray-400 ml-2">
          Available: 💰 {Math.floor(money).toLocaleString()}
        </span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gunUpgrades.map((gun: Gun) => {
          const isPurchased = purchasedGuns.some(g => g.id === gun.id);
          const canAfford = money >= gun.cost;

          return (
            <div
              key={gun.id}
              className={`bg-gray-700 p-4 rounded-lg ${
                isPurchased ? 'border-2 border-green-500' : ''
              }`}
            >
              <h3 className="text-lg font-semibold text-white">{gun.name}</h3>
              <p className="text-sm text-gray-300 mb-2">{gun.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-yellow-400">💰 {gun.cost.toLocaleString()}</span>
                <span className="text-red-400">+{gun.damage} DMG</span>
              </div>
              <button
                onClick={() => purchaseGun(gun.id)}
                disabled={isPurchased || !canAfford}
                className={`w-full mt-2 px-4 py-2 rounded-lg font-semibold ${
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