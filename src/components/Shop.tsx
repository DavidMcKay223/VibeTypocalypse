import React from 'react';
import { useGameStore, shopItems } from '../store/gameStore';

const Shop: React.FC = () => {
  const { 
    availableUpgrades, 
    resources,
    level,
    purchaseUpgrade,
    money
  } = useGameStore();

  const canAffordUpgrade = (upgrade: typeof availableUpgrades[0]) => {
    if (upgrade.cost.resource) {
      const { name, amount } = upgrade.cost.resource;
      const resource = resources.find(r => r.name === name);
      return resource && resource.amount >= amount;
    }
    if (upgrade.cost.levels) {
      return level >= (upgrade.requiresLevel || 0) && level - upgrade.cost.levels >= 1;
    }
    return false;
  };

  const normalUpgrades = availableUpgrades.filter(u => u.type !== 'prestige');
  const prestigeUpgrades = availableUpgrades.filter(u => u.type === 'prestige');

  const getUpgradeClass = (upgrade: typeof availableUpgrades[0]) => {
    if (upgrade.purchased) {
      return 'bg-gray-800 border-gray-600 opacity-75';
    }
    if (level < (upgrade.requiresLevel || 0)) {
      return 'bg-gray-800 border-red-700 opacity-50';
    }
    if (canAffordUpgrade(upgrade)) {
      return 'bg-gray-800 border-purple-400 hover:bg-gray-700 cursor-pointer';
    }
    return 'bg-gray-800 border-red-700 opacity-75';
  };

  const getUpgradeStatus = (upgrade: typeof availableUpgrades[0]) => {
    if (upgrade.purchased) {
      return { text: 'Purchased', class: 'text-green-400' };
    }
    if (level < (upgrade.requiresLevel || 0)) {
      return { 
        text: `Unlocks at ${upgrade.requiresLevel}`, 
        class: 'text-red-400' 
      };
    }
    return { text: 'Available', class: 'text-purple-400' };
  };

  const handlePurchase = (item: typeof shopItems[0]) => {
    if (money >= item.cost) {
      purchaseUpgrade(item.id);
    }
  };

  return (
    <div className="space-y-8">
      {/* Regular Upgrades */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold text-white mb-4">Resource Upgrades</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {normalUpgrades.map((upgrade) => (
            <div
              key={upgrade.id}
              className={`p-4 rounded-lg ${
                upgrade.purchased
                  ? 'bg-gray-700 opacity-75'
                  : canAffordUpgrade(upgrade)
                  ? 'bg-blue-900 hover:bg-blue-800 cursor-pointer'
                  : 'bg-red-900 opacity-75'
              }`}
              onClick={() => !upgrade.purchased && canAffordUpgrade(upgrade) && purchaseUpgrade(upgrade.id)}
            >
              <h3 className="text-xl font-semibold text-white mb-2">{upgrade.name}</h3>
              <p className="text-gray-300 mb-2">{upgrade.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">
                  Cost: {upgrade.cost.resource?.amount} {upgrade.cost.resource?.name}
                </span>
                <span className={`text-sm ${upgrade.purchased ? 'text-green-400' : 'text-yellow-400'}`}>
                  {upgrade.purchased ? 'Purchased' : 'Available'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Prestige Upgrades */}
      <div className="p-4 bg-purple-900 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">Prestige Upgrades</h2>
          <span className="text-purple-200">Current Level: {level}</span>
        </div>
        <p className="text-purple-200 mb-4">
          Powerful permanent upgrades that require sacrificing levels. Your level must be higher than the required level plus the sacrifice cost.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prestigeUpgrades.map((upgrade) => (
            <div
              key={upgrade.id}
              className={`p-4 rounded-lg border-2 ${getUpgradeClass(upgrade)}`}
              onClick={() => !upgrade.purchased && canAffordUpgrade(upgrade) && purchaseUpgrade(upgrade.id)}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-white">{upgrade.name}</h3>
                {!upgrade.purchased && upgrade.requiresLevel && (
                  <span className="text-sm px-2 py-1 rounded bg-purple-800 text-purple-200">
                    Requires Level {upgrade.requiresLevel}
                  </span>
                )}
              </div>
              <p className="text-gray-300 mb-3">{upgrade.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-300">
                  Sacrifice: {upgrade.cost.levels} levels
                </span>
                <span className={`text-sm ${getUpgradeStatus(upgrade).class}`}>
                  {getUpgradeStatus(upgrade).text}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shop Items */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Shop</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shopItems.map((item) => (
            <div
              key={item.id}
              className="bg-gray-700 p-4 rounded-lg relative group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <span className="text-yellow-400">💰 {item.cost.toLocaleString()}</span>
              </div>
              <p className="text-gray-300 text-sm mb-4">{item.description}</p>
              {item.type === 'consumable' && item.effect.duration && (
                <p className="text-blue-400 text-sm mb-4">
                  Duration: {Math.floor(item.effect.duration / 60)} minutes
                </p>
              )}
              <button
                onClick={() => handlePurchase(item)}
                disabled={money < item.cost}
                className={`w-full py-2 px-4 rounded-lg font-semibold ${
                  money >= item.cost
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                Purchase
              </button>
              {/* Tooltip for consumables */}
              {item.type === 'consumable' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Consumable item - Effects are temporary
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop; 