import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAchievementStore } from './achievementStore';

// Export interfaces for use in components
export interface Resource {
  name: string;
  amount: number;
  perSecond: number;
}

export interface Enemy {
  id: string;
  health: number;
  maxHealth: number;
  damage: number;
  reward: number;
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: {
    resource?: { name: string; amount: number };
    levels?: number;
  };
  type: 'typing' | 'factory' | 'combat' | 'prestige' | 'permanent' | 'consumable';
  effect: {
    type: string;
    multiplier: number;
    duration?: number;
  };
  purchased: boolean;
  requiresLevel?: number;
}

export interface Factory {
  id: string;
  name: string;
  description: string;
  level: number;
  unlockLevel: number;
  unlocked: boolean;
  active: boolean;
  baseCost: { resource: string; amount: number };
  effects: {
    scrapProduction?: number;
    energyProduction?: number;
    typingDamageBonus?: number;
    autoAttackBonus?: number;
    experienceBonus?: number;
    resourceBonus?: number;
  };
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'permanent' | 'consumable';
  effect: {
    type: string;
    multiplier: number;
    duration?: number;
  };
}

export interface Gun {
  id: string;
  name: string;
  description: string;
  cost: number;
  damage: number;
}

export interface Buff {
  id: string;
  type: string;
  multiplier: number;
  endTime: number;
}

export type MultiplierType = 'damage' | 'resource' | 'experience' | 'money' | 'all';

// Define the methods interface
interface GameStateMethods {
  addExperience: (amount: number) => void;
  updateResource: (resourceName: string, amount: number) => void;
  updateTypingStats: (wpm: number, accuracy: number) => void;
  spawnWave: () => void;
  damageEnemy: (enemyId: string, damage: number, splashCount?: number) => void;
  incrementWave: () => void;
  resetGame: () => void;
  calculateAutoAttackDamage: () => number;
  getActiveBuffMultiplier: (type: string) => number;
  addBuff: (buff: Buff) => void;
  removeBuff: (buffId: string) => void;
  addPermanentMultiplier: (type: MultiplierType, amount: number) => void;
  applyBuff: (buffId: string, type: string, multiplier: number, duration: number) => void;
  purchaseGun: (gunId: string) => void;
  purchaseUpgrade: (upgradeId: string) => void;
  upgradeFactory: (factoryId: string) => void;
  toggleFactory: (factoryId: string) => void;
  unlockFactory: (factoryId: string) => void;
}

// Define the base state without methods
interface GameStateBase {
  level: number;
  experience: number;
  typingSpeed: number;
  accuracy: number;
  money: number;
  resources: Resource[];
  wave: number;
  enemies: Enemy[];
  autoAttackDamage: number;
  baseDamage: number;
  productionMultiplier: number;
  typingDamageMultiplier: number;
  purchasedGuns: Gun[];
  activeBuffs: Buff[];
  factories: Factory[];
  availableUpgrades: Upgrade[];
  permanentMultipliers: {
    damage: number;
    resource: number;
    experience: number;
    money: number;
    all: number;
  };
}

// Combine base state and methods
type GameState = GameStateBase & GameStateMethods;

// Type for state updates (only allows updating base state properties)
type GameStateUpdates = Partial<GameStateBase>;

// Update all upgrade effects in initial state
const initialUpgrades: Upgrade[] = [
  {
    id: 'typing-speed-1',
    name: 'Swift Fingers',
    description: 'Increase typing damage by 25%',
    cost: { resource: { name: 'Scrap', amount: 100 } },
    type: 'typing',
    effect: { type: 'typing', multiplier: 1.25 },
    purchased: false
  },
  {
    id: 'factory-1',
    name: 'Advanced Automation',
    description: 'Increase factory production by 50%',
    cost: { resource: { name: 'Energy', amount: 150 } },
    type: 'factory',
    effect: { type: 'resource', multiplier: 1.5 },
    purchased: false
  },
  {
    id: 'combat-1',
    name: 'Auto-Turret',
    description: 'Double auto-attack damage',
    cost: { resource: { name: 'Scrap', amount: 200 } },
    type: 'combat',
    effect: { type: 'damage', multiplier: 2 },
    purchased: false
  },
  {
    id: 'prestige-typing-mastery',
    name: 'Typing Mastery',
    description: 'Sacrifice 5 levels to permanently increase typing damage by 100%',
    cost: { levels: 5 },
    type: 'prestige',
    requiresLevel: 10,
    effect: { type: 'typing', multiplier: 2 },
    purchased: false
  },
  {
    id: 'prestige-resource-mastery',
    name: 'Resource Mastery',
    description: 'Sacrifice 8 levels to permanently increase all resource generation by 150%',
    cost: { levels: 8 },
    type: 'prestige',
    requiresLevel: 10,
    effect: { type: 'resource', multiplier: 1.5 },
    purchased: false
  },
  {
    id: 'prestige-combat-mastery',
    name: 'Combat Mastery',
    description: 'Sacrifice 10 levels to permanently increase auto-attack damage by 200%',
    cost: { levels: 10 },
    type: 'prestige',
    requiresLevel: 10,
    effect: { type: 'damage', multiplier: 3 },
    purchased: false
  },
  {
    id: 'prestige-exp-boost',
    name: 'Experience Mastery',
    description: 'Sacrifice 12 levels to permanently gain 50% more experience from all sources',
    cost: { levels: 12 },
    type: 'prestige',
    requiresLevel: 10,
    effect: { type: 'experience', multiplier: 0.5 },
    purchased: false
  },
  {
    id: 'prestige-quantum-mastery',
    name: 'Quantum Mastery',
    description: 'Sacrifice 15 levels to permanently increase ALL damage and production by 100%',
    cost: { levels: 15 },
    type: 'prestige',
    requiresLevel: 10,
    effect: { type: 'all', multiplier: 1 },
    purchased: false
  }
];

// Shop item definitions
export const shopItems: ShopItem[] = [
  // Permanent Upgrades
  {
    id: 'damage-boost',
    name: 'Damage Amplifier',
    description: 'Permanently increase all damage by 25%',
    cost: 50000,
    type: 'permanent',
    effect: { type: 'damage', multiplier: 1.25 }
  },
  {
    id: 'resource-boost',
    name: 'Resource Synthesizer',
    description: 'Permanently increase all resource production by 50%',
    cost: 75000,
    type: 'permanent',
    effect: { type: 'resource', multiplier: 1.5 }
  },
  {
    id: 'exp-boost',
    name: 'Experience Catalyst',
    description: 'Permanently increase experience gain by 100%',
    cost: 100000,
    type: 'permanent',
    effect: { type: 'experience', multiplier: 2 }
  },
  {
    id: 'money-boost',
    name: 'Money Printer',
    description: 'Permanently increase money rewards by 75%',
    cost: 150000,
    type: 'permanent',
    effect: { type: 'money', multiplier: 1.75 }
  },
  {
    id: 'ultimate-boost',
    name: 'Ultimate Enhancer',
    description: 'Permanently increase ALL gains by 50%',
    cost: 500000,
    type: 'permanent',
    effect: { type: 'all', multiplier: 1.5 }
  },
  
  // Consumable Power-ups
  {
    id: 'damage-potion',
    name: 'Damage Potion',
    description: 'Triple damage for 5 minutes',
    cost: 5000,
    type: 'consumable',
    effect: { type: 'damage', multiplier: 3, duration: 300 }
  },
  {
    id: 'resource-potion',
    name: 'Resource Potion',
    description: 'Double resource production for 10 minutes',
    cost: 7500,
    type: 'consumable',
    effect: { type: 'resource', multiplier: 2, duration: 600 }
  },
  {
    id: 'exp-potion',
    name: 'Experience Potion',
    description: 'Double experience gain for 15 minutes',
    cost: 10000,
    type: 'consumable',
    effect: { type: 'experience', multiplier: 2, duration: 900 }
  },
  {
    id: 'mega-potion',
    name: 'Mega Potion',
    description: 'Double ALL gains for 30 minutes',
    cost: 25000,
    type: 'consumable',
    effect: { type: 'all', multiplier: 2, duration: 1800 }
  }
];

export const gunUpgrades: Gun[] = [
  {
    id: 'pistol',
    name: 'Pistol',
    description: 'Basic sidearm with reliable damage',
    cost: 500,
    damage: 10
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    description: 'High damage at close range',
    cost: 2500,
    damage: 35
  },
  {
    id: 'rifle',
    name: 'Assault Rifle',
    description: 'Balanced weapon with good damage output',
    cost: 7500,
    damage: 75
  },
  {
    id: 'sniper',
    name: 'Sniper Rifle',
    description: 'High precision weapon with massive damage',
    cost: 25000,
    damage: 200
  },
  {
    id: 'plasma',
    name: 'Plasma Cannon',
    description: 'Advanced energy weapon with devastating power',
    cost: 100000,
    damage: 500
  }
];

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial State
      level: 1,
      experience: 0,
      typingSpeed: 0,
      accuracy: 0,
      money: 100,
      resources: [
        { name: 'Scrap', amount: 50, perSecond: 1 },
        { name: 'Energy', amount: 25, perSecond: 0.5 },
      ],
      wave: 1,
      enemies: [],
      autoAttackDamage: 1,
      baseDamage: 3,
      productionMultiplier: 1,
      typingDamageMultiplier: 1,
      purchasedGuns: [],
      activeBuffs: [],
      factories: [
        {
          id: 'scrap-collector',
          name: 'Scrap Collector',
          description: 'Basic scrap collection from the environment',
          level: 1,
          unlockLevel: 1,
          unlocked: true,
          active: true,
          baseCost: { resource: 'Scrap', amount: 50 },
          effects: {
            scrapProduction: 1,
            autoAttackBonus: 0
          }
        },
        {
          id: 'energy-generator',
          name: 'Energy Generator',
          description: 'Converts scrap into energy',
          level: 1,
          unlockLevel: 2,
          unlocked: false,
          active: false,
          baseCost: { resource: 'Scrap', amount: 100 },
          effects: {
            energyProduction: 0.5,
            autoAttackBonus: 0
          }
        },
        {
          id: 'advanced-collector',
          name: 'Advanced Collector',
          description: 'Enhanced scrap collection with energy assistance',
          level: 0,
          unlockLevel: 3,
          unlocked: false,
          active: false,
          baseCost: { resource: 'Energy', amount: 150 },
          effects: {
            scrapProduction: 2.5,
            energyProduction: -0.1,
            autoAttackBonus: 0.02
          }
        },
        {
          id: 'quantum-processor',
          name: 'Quantum Processor',
          description: 'Boosts typing damage using quantum calculations',
          level: 0,
          unlockLevel: 4,
          unlocked: false,
          active: false,
          baseCost: { resource: 'Energy', amount: 200 },
          effects: {
            typingDamageBonus: 0.1,
            energyProduction: 1,
            autoAttackBonus: 0.05
          }
        },
        {
          id: 'matter-synthesizer',
          name: 'Matter Synthesizer',
          description: 'Creates scrap from energy using matter synthesis',
          level: 0,
          unlockLevel: 5,
          unlocked: false,
          active: false,
          baseCost: { resource: 'Energy', amount: 300 },
          effects: {
            scrapProduction: 5,
            energyProduction: -0.5,
            autoAttackBonus: 0.03
          }
        },
        {
          id: 'energy-amplifier',
          name: 'Energy Amplifier',
          description: 'Amplifies energy production through resonance',
          level: 0,
          unlockLevel: 6,
          unlocked: false,
          active: false,
          baseCost: { resource: 'Scrap', amount: 400 },
          effects: {
            energyProduction: 3,
            typingDamageBonus: 0.05
          }
        },
        {
          id: 'combat-forge',
          name: 'Combat Forge',
          description: 'Enhances weapons using scrap and energy',
          level: 0,
          unlockLevel: 7,
          unlocked: false,
          active: false,
          baseCost: { resource: 'Energy', amount: 500 },
          effects: {
            autoAttackBonus: 0.15,
            scrapProduction: -0.5,
            energyProduction: -0.5
          }
        },
        {
          id: 'typing-enhancer',
          name: 'Typing Enhancer',
          description: 'Dramatically increases typing damage',
          level: 0,
          unlockLevel: 8,
          unlocked: false,
          active: false,
          baseCost: { resource: 'Energy', amount: 600 },
          effects: {
            typingDamageBonus: 0.25,
            energyProduction: -0.2
          }
        },
        {
          id: 'resource-synthesizer',
          name: 'Resource Synthesizer',
          description: 'Generates both scrap and energy efficiently',
          level: 0,
          unlockLevel: 9,
          unlocked: false,
          active: false,
          baseCost: { resource: 'Scrap', amount: 800 },
          effects: {
            scrapProduction: 4,
            energyProduction: 2,
            resourceBonus: 0.05
          }
        },
        {
          id: 'quantum-amplifier',
          name: 'Quantum Amplifier',
          description: 'Uses quantum mechanics to boost all production',
          level: 0,
          unlockLevel: 10,
          unlocked: false,
          active: false,
          baseCost: { resource: 'Energy', amount: 1000 },
          effects: {
            scrapProduction: 3,
            energyProduction: 3,
            typingDamageBonus: 0.1,
            autoAttackBonus: 0.1,
            resourceBonus: 0.1
          }
        },
        {
          id: 'experience-matrix',
          name: 'Experience Matrix',
          description: 'Enhances experience gain through quantum computing',
          level: 0,
          unlockLevel: 12,
          unlocked: false,
          active: false,
          baseCost: { resource: 'Energy', amount: 1500 },
          effects: {
            experienceBonus: 0.2,
            energyProduction: -1
          }
        },
        {
          id: 'ultimate-factory',
          name: 'Ultimate Factory',
          description: 'The pinnacle of factory technology',
          level: 0,
          unlockLevel: 15,
          unlocked: false,
          active: false,
          baseCost: { resource: 'Energy', amount: 2000 },
          effects: {
            scrapProduction: 10,
            energyProduction: 5,
            typingDamageBonus: 0.2,
            autoAttackBonus: 0.2,
            experienceBonus: 0.1,
            resourceBonus: 0.15
          }
        }
      ],
      availableUpgrades: initialUpgrades,
      permanentMultipliers: {
        damage: 1,
        resource: 1,
        experience: 1,
        money: 1,
        all: 1
      },
      
      // Methods
      addExperience: (amount: number) => {
        const state = get();
        const buffMultiplier = state.getActiveBuffMultiplier('experience');
        const totalExp = Math.floor(amount * buffMultiplier);
        
        const updates: GameStateUpdates = {
          experience: state.experience + totalExp
        };

        // Check for level up
        const expForNextLevel = Math.floor(100 * Math.pow(1.1, state.level - 1));
        if (updates.experience && updates.experience >= expForNextLevel) {
          updates.level = state.level + 1;
          updates.experience = 0;
        }

        set(updates);
      },

      updateResource: (resourceName: string, amount: number) => set((state) => {
        const buffMultiplier = state.getActiveBuffMultiplier('resource');
        const resourceBonus = state.factories.reduce((bonus, factory) => {
          if (factory.active && factory.effects.resourceBonus) {
            return bonus * (1 + factory.effects.resourceBonus * factory.level);
          }
          return bonus;
        }, 1);

        // Calculate per second production rates
        const resourceRates = {
          Scrap: 0,
          Energy: 0
        };

        state.factories.forEach(factory => {
          if (factory.active && factory.level > 0) {
            if (factory.effects.scrapProduction) {
              resourceRates.Scrap += factory.effects.scrapProduction * factory.level;
            }
            if (factory.effects.energyProduction) {
              resourceRates.Energy += factory.effects.energyProduction * factory.level;
            }
          }
        });

        // Apply resource bonus to production rates
        Object.keys(resourceRates).forEach(key => {
          resourceRates[key as keyof typeof resourceRates] *= resourceBonus;
        });

        // Update achievements for resource accumulation and production
        const { updateProgress } = useAchievementStore.getState();
        const updatedResources = state.resources.map(resource => {
          const newAmount = resource.name === resourceName
            ? resource.amount + (amount * resourceBonus * buffMultiplier)
            : resource.amount;
          
          // Track resource accumulation achievements
          if (resource.name === 'Scrap') {
            updateProgress('scrap-hoarder', newAmount);
          } else if (resource.name === 'Energy') {
            updateProgress('energy-master', newAmount);
          }

          // Track resource production rate achievement
          const newPerSecond = resourceRates[resource.name as keyof typeof resourceRates];
          const totalProduction = Object.values(resourceRates).reduce((sum, rate) => sum + rate, 0);
          updateProgress('resource-production', totalProduction);

          return {
            ...resource,
            amount: newAmount,
            perSecond: newPerSecond
          };
        });

        return { resources: updatedResources };
      }),

      // Helper to calculate total auto attack damage including bonuses
      calculateAutoAttackDamage: () => {
        const state = get();
        const baseAutoAttack = state.baseDamage || 0;
        const buffMultiplier = state.getActiveBuffMultiplier('damage') || 1;
        const permanentMultiplier = (state.permanentMultipliers.damage || 1) * (state.permanentMultipliers.all || 1);
        
        // Calculate gun bonus
        const gunBonus = state.purchasedGuns.reduce((total, gun) => total + (gun.damage || 0), 0);
        
        // Calculate factory bonus
        const factoryBonus = state.factories.reduce((bonus, factory) => {
          if (factory.active && factory.effects.autoAttackBonus) {
            return bonus * (1 + (factory.effects.autoAttackBonus * factory.level));
          }
          return bonus;
        }, 1);

        // Ensure we return a valid number
        const totalDamage = (baseAutoAttack * buffMultiplier * permanentMultiplier * factoryBonus) + gunBonus;
        return isNaN(totalDamage) ? 0 : Math.floor(totalDamage);
      },

      spawnWave: () => set(state => {
        const baseHealth = 100;
        const healthScaling = 1.25; // 25% increase per wave
        const waveHealthMultiplier = Math.pow(healthScaling, state.wave - 1);
        
        const newEnemies = Array(state.wave).fill(null).map((_, index) => ({
          id: `enemy-${state.wave}-${index}`,
          health: Math.floor(baseHealth * waveHealthMultiplier),
          maxHealth: Math.floor(baseHealth * waveHealthMultiplier),
          damage: Math.floor(5 * Math.pow(1.1, state.wave - 1)),
          type: 'zombie',
          reward: Math.floor(25 * Math.pow(1.1, state.wave - 1))
        }));
        
        return {
          enemies: newEnemies,
        };
      }),
      
      updateTypingStats: (wpm: number, accuracy: number) => set(() => ({
        typingSpeed: wpm,
        accuracy: accuracy,
      })),

      purchaseUpgrade: (upgradeId: string) => set(state => {
        // First check shop items
        const shopItem = shopItems.find(item => item.id === upgradeId);
        if (shopItem) {
          if (state.money < shopItem.cost) return state;

          const updates: Partial<GameState> = {
            money: state.money - shopItem.cost
          };

          // Track money spent achievement
          const { updateProgress } = useAchievementStore.getState();
          updateProgress('money-spender', shopItem.cost);

          if (shopItem.type === 'permanent') {
            updates.permanentMultipliers = {
              ...state.permanentMultipliers,
              [shopItem.effect.type]: 
                (state.permanentMultipliers[shopItem.effect.type as keyof typeof state.permanentMultipliers] || 1) * 
                shopItem.effect.multiplier
            };
          } else if (shopItem.type === 'consumable' && shopItem.effect.duration) {
            state.applyBuff(
              shopItem.id,
              shopItem.effect.type,
              shopItem.effect.multiplier,
              shopItem.effect.duration
            );
          }

          return updates;
        }

        // Then check regular upgrades
        const upgrade = state.availableUpgrades.find(u => u.id === upgradeId);
        if (!upgrade) return state;

        // Check if we can afford the upgrade
        const resourceCost = upgrade.cost.resource;
        if (resourceCost) {
          const resource = state.resources.find(r => r.name === resourceCost.name);
          if (!resource || resource.amount < resourceCost.amount) return state;
        }

        if (upgrade.cost.levels) {
          if (state.level < (upgrade.requiresLevel || 0) || state.level - upgrade.cost.levels < 1) {
            return state;
          }
        }

        const updates: Partial<GameState> = {
          availableUpgrades: state.availableUpgrades.map(u =>
            u.id === upgradeId ? { ...u, purchased: true } : u
          )
        };

        // Apply costs
        if (resourceCost) {
          updates.resources = state.resources.map(r =>
            r.name === resourceCost.name
              ? { ...r, amount: r.amount - resourceCost.amount }
              : r
          );
        }

        if (upgrade.cost.levels) {
          updates.level = state.level - upgrade.cost.levels;
          updates.experience = 0;
        }

        // Apply effects based on type
        if (upgrade.type === 'permanent' || upgrade.type === 'prestige') {
          updates.permanentMultipliers = {
            ...state.permanentMultipliers,
            [upgrade.effect.type]: 
              (state.permanentMultipliers[upgrade.effect.type as keyof typeof state.permanentMultipliers] || 1) * 
              upgrade.effect.multiplier
          };
        } else if (upgrade.type === 'consumable' && upgrade.effect.duration) {
          state.applyBuff(
            upgrade.id,
            upgrade.effect.type,
            upgrade.effect.multiplier,
            upgrade.effect.duration
          );
        }

        return updates;
      }),

      upgradeFactory: (factoryId: string) => set(state => {
        const factory = state.factories.find(f => f.id === factoryId);
        if (!factory || !factory.unlocked) return state;

        const cost = factory.baseCost.amount * (factory.level + 1);
        const resource = state.resources.find(r => r.name === factory.baseCost.resource);
        
        if (!resource || resource.amount < cost) return state;

        const updatedResources = state.resources.map(r =>
          r.name === factory.baseCost.resource
            ? { ...r, amount: r.amount - cost }
            : r
        );

        const updatedFactories = state.factories.map(f =>
          f.id === factoryId
            ? { ...f, level: f.level + 1 }
            : f
        );

        return {
          resources: updatedResources,
          factories: updatedFactories
        };
      }),

      toggleFactory: (factoryId: string) => set(state => ({
        factories: state.factories.map(f =>
          f.id === factoryId && f.unlocked
            ? { ...f, active: !f.active }
            : f
        )
      })),

      resetGame: () => {
        // Reset achievements first
        useAchievementStore.getState().resetAllAchievements();
        
        // Then reset game state
        set({
          level: 1,
          experience: 0,
          typingSpeed: 0,
          accuracy: 100,
          money: 100,
          resources: [
            { name: 'Scrap', amount: 50, perSecond: 0 },
            { name: 'Energy', amount: 25, perSecond: 0 }
          ],
          wave: 1,
          enemies: [],
          autoAttackDamage: 1,
          baseDamage: 3,
          productionMultiplier: 1,
          typingDamageMultiplier: 1,
          purchasedGuns: [],
          activeBuffs: [],
          permanentMultipliers: {
            damage: 1,
            resource: 1,
            experience: 1,
            money: 1,
            all: 1
          },
          factories: get().factories.map(factory => ({
            ...factory,
            level: factory.id === 'scrap-collector' ? 1 : 0,
            unlocked: factory.id === 'scrap-collector',
            active: factory.id === 'scrap-collector'
          })),
          availableUpgrades: initialUpgrades
        });
      },

      incrementWave: () => set(state => ({ wave: state.wave + 1 })),

      damageEnemy: (enemyId: string, damage: number, splashCount: number = 3) => set(state => {
        // Calculate total damage including all multipliers
        const buffMultiplier = state.getActiveBuffMultiplier('damage') || 1;
        const permanentMultiplier = (state.permanentMultipliers.damage || 1) * (state.permanentMultipliers.all || 1);
        
        // Calculate factory bonus
        const factoryBonus = state.factories.reduce((bonus, factory) => {
          if (factory.active) {
            if (factory.effects.typingDamageBonus) {
              bonus.typing *= (1 + (factory.effects.typingDamageBonus * factory.level));
            }
            if (factory.effects.autoAttackBonus) {
              bonus.autoAttack *= (1 + (factory.effects.autoAttackBonus * factory.level));
            }
          }
          return bonus;
        }, { typing: 1, autoAttack: 1 });

        // Calculate auto attack damage (no reduction for base damage)
        const baseAutoAttack = state.baseDamage || 0;
        const gunBonus = state.purchasedGuns.reduce((total, gun) => total + (gun.damage || 0), 0);
        const totalAutoAttackDamage = (baseAutoAttack * buffMultiplier * permanentMultiplier * factoryBonus.autoAttack) + gunBonus;

        // If damage is provided (from typing or clicking), add it to the total
        // Click damage gets full gun bonus and general multipliers
        const totalDamage = damage > 0 
          ? totalAutoAttackDamage + (damage * buffMultiplier * permanentMultiplier)
          : totalAutoAttackDamage;

        // Get target enemy and nearby enemies (up to splashCount total)
        const targetIndex = state.enemies.findIndex(e => e.id === enemyId);
        if (targetIndex === -1) return state;

        // Get indices for splash damage (enemies before and after the target)
        const splashIndices = new Set<number>([targetIndex]);
        let before = targetIndex - 1;
        let after = targetIndex + 1;
        
        // Build chain reaction multipliers (reduced multipliers)
        const chainMultipliers: number[] = [];
        for (let i = 0; i < splashCount; i++) {
          // Each subsequent hit in the chain does 20% more damage than the last
          chainMultipliers.push(1 + (i * 0.2));
        }

        while (splashIndices.size < splashCount && (before >= 0 || after < state.enemies.length)) {
          if (before >= 0) {
            splashIndices.add(before);
            before--;
          }
          if (after < state.enemies.length && splashIndices.size < splashCount) {
            splashIndices.add(after);
            after++;
          }
        }

        // Convert to array and sort for consistent chain order
        const orderedIndices = Array.from(splashIndices).sort();

        const updatedEnemies = state.enemies.map((enemy, index) => {
          const chainIndex = orderedIndices.indexOf(index);
          if (chainIndex !== -1) {
            // Apply chain reaction multiplier
            const chainMultiplier = chainMultipliers[chainIndex];
            const damageAmount = Math.floor(totalDamage * chainMultiplier);
            const newHealth = Math.max(0, enemy.health - damageAmount);
            return { ...enemy, health: newHealth };
          }
          return enemy;
        });

        const deadEnemies = updatedEnemies.filter(e => e.health <= 0);
        const remainingEnemies = updatedEnemies.filter(e => e.health > 0);

        // Calculate rewards from dead enemies
        const moneyReward = deadEnemies.reduce((sum, e) => sum + e.reward, 0);
        const expReward = deadEnemies.length * (state.wave * 15);
        const resourceReward = deadEnemies.length * (state.wave * 8);

        // Track money accumulation achievement when receiving rewards
        const { updateProgress } = useAchievementStore.getState();
        const newMoney = state.money + moneyReward;
        updateProgress('money-millionaire', newMoney);

        // If all enemies are cleared, increment wave
        if (remainingEnemies.length === 0) {
          return {
            enemies: remainingEnemies,
            wave: state.wave + 1,
            experience: state.experience + expReward,
            money: newMoney,
            resources: state.resources.map(resource => ({
              ...resource,
              amount: resource.amount + resourceReward
            }))
          };
        }

        return { 
          enemies: remainingEnemies,
          money: newMoney,
          experience: state.experience + expReward,
          resources: state.resources.map(resource => ({
            ...resource,
            amount: resource.amount + resourceReward
          }))
        };
      }),

      purchaseGun: (gunId: string) => {
        const gun = gunUpgrades.find(g => g.id === gunId);
        if (!gun) return;

        set(state => {
          if (state.money >= gun.cost && !state.purchasedGuns.some(g => g.id === gun.id)) {
            // Track money spent and arsenal achievements
            const { updateProgress } = useAchievementStore.getState();
            updateProgress('money-spender', gun.cost);
            
            const newPurchasedGuns = [...state.purchasedGuns, gun];
            // Update arsenal achievement with current gun count
            updateProgress('arsenal-collector', newPurchasedGuns.length);

            return {
              money: state.money - gun.cost,
              purchasedGuns: newPurchasedGuns,
              baseDamage: state.baseDamage + gun.damage
            };
          }
          return state;
        });
      },

      applyBuff: (buffId: string, type: string, multiplier: number, duration: number) => {
        const buff: Buff = {
          id: buffId,
          type,
          multiplier,
          endTime: Date.now() + duration
        };
        set(state => ({
          activeBuffs: [...state.activeBuffs, buff]
        }));
      },

      removeBuff: (buffId: string) =>
        set(state => {
          const now = Date.now();
          return {
            activeBuffs: state.activeBuffs.filter(buff => 
              buff.id !== buffId && buff.endTime > now
            )
          };
        }),

      getActiveBuffMultiplier: (type: string) => {
        const state = get();
        const now = Date.now();
        
        // Clean up expired buffs
        const expiredBuffs = state.activeBuffs.filter(buff => buff.endTime <= now);
        if (expiredBuffs.length > 0) {
          set(state => ({
            activeBuffs: state.activeBuffs.filter(buff => buff.endTime > now)
          }));
        }

        // Calculate total multiplier from active buffs
        const buffMultiplier = state.activeBuffs
          .filter(buff => buff.endTime > now)
          .reduce((total, buff) => {
            if (buff.type === type || buff.type === 'all') {
              return total * buff.multiplier;
            }
            return total;
          }, 1);

        // Apply permanent multipliers
        const permanentMultiplier = 
          state.permanentMultipliers[type as keyof typeof state.permanentMultipliers] *
          state.permanentMultipliers.all;

        return buffMultiplier * permanentMultiplier;
      },

      addBuff: (buff: Buff) => set(state => ({
        activeBuffs: [...state.activeBuffs, buff]
      })),

      addPermanentMultiplier: (type: MultiplierType, amount: number) => set(state => ({
        permanentMultipliers: {
          ...state.permanentMultipliers,
          [type]: state.permanentMultipliers[type] * amount
        }
      })),

      unlockFactory: (factoryId: string) => set(state => {
        const factory = state.factories.find(f => f.id === factoryId);
        if (!factory || factory.unlocked) return state;

        const resource = state.resources.find(r => r.name === factory.baseCost.resource);
        if (!resource || resource.amount < factory.baseCost.amount) return state;

        // Deduct the cost
        const updatedResources = state.resources.map(r =>
          r.name === factory.baseCost.resource
            ? { ...r, amount: r.amount - factory.baseCost.amount }
            : r
        );

        // Update the factory
        const updatedFactories = state.factories.map(f =>
          f.id === factoryId
            ? { ...f, unlocked: true, level: 1, active: true }
            : f
        );

        return {
          resources: updatedResources,
          factories: updatedFactories
        };
      }),
    }),
    {
      name: 'game-storage',
      version: 3, // Increment version to force state migration
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          // Reset to initial state with correct factories
          const state = persistedState as GameState;
          return {
            ...state,
            factories: [
              {
                id: 'scrap-collector',
                name: 'Scrap Collector',
                description: 'Basic scrap collection from the environment',
                level: 1,
                unlockLevel: 1,
                unlocked: true,
                active: true,
                baseCost: { resource: 'Scrap', amount: 50 },
                effects: {
                  scrapProduction: 1,
                  autoAttackBonus: 0
                }
              },
              {
                id: 'energy-generator',
                name: 'Energy Generator',
                description: 'Converts scrap into energy',
                level: 0,
                unlockLevel: 2,
                unlocked: false,
                active: false,
                baseCost: { resource: 'Scrap', amount: 100 },
                effects: {
                  energyProduction: 0.5,
                  autoAttackBonus: 0
                }
              },
              {
                id: 'advanced-collector',
                name: 'Advanced Collector',
                description: 'Enhanced scrap collection with energy assistance',
                level: 0,
                unlockLevel: 3,
                unlocked: false,
                active: false,
                baseCost: { resource: 'Energy', amount: 150 },
                effects: {
                  scrapProduction: 2.5,
                  energyProduction: -0.1,
                  autoAttackBonus: 0.02
                }
              },
              {
                id: 'quantum-processor',
                name: 'Quantum Processor',
                description: 'Boosts typing damage using quantum calculations',
                level: 0,
                unlockLevel: 4,
                unlocked: false,
                active: false,
                baseCost: { resource: 'Energy', amount: 200 },
                effects: {
                  typingDamageBonus: 0.1,
                  energyProduction: 1,
                  autoAttackBonus: 0.05
                }
              },
              {
                id: 'matter-synthesizer',
                name: 'Matter Synthesizer',
                description: 'Creates scrap from energy using matter synthesis',
                level: 0,
                unlockLevel: 5,
                unlocked: false,
                active: false,
                baseCost: { resource: 'Energy', amount: 300 },
                effects: {
                  scrapProduction: 5,
                  energyProduction: -0.5,
                  autoAttackBonus: 0.03
                }
              },
              {
                id: 'energy-amplifier',
                name: 'Energy Amplifier',
                description: 'Amplifies energy production through resonance',
                level: 0,
                unlockLevel: 6,
                unlocked: false,
                active: false,
                baseCost: { resource: 'Scrap', amount: 400 },
                effects: {
                  energyProduction: 3,
                  typingDamageBonus: 0.05
                }
              },
              {
                id: 'combat-forge',
                name: 'Combat Forge',
                description: 'Enhances weapons using scrap and energy',
                level: 0,
                unlockLevel: 7,
                unlocked: false,
                active: false,
                baseCost: { resource: 'Energy', amount: 500 },
                effects: {
                  autoAttackBonus: 0.15,
                  scrapProduction: -0.5,
                  energyProduction: -0.5
                }
              },
              {
                id: 'typing-enhancer',
                name: 'Typing Enhancer',
                description: 'Dramatically increases typing damage',
                level: 0,
                unlockLevel: 8,
                unlocked: false,
                active: false,
                baseCost: { resource: 'Energy', amount: 600 },
                effects: {
                  typingDamageBonus: 0.25,
                  energyProduction: -0.2
                }
              },
              {
                id: 'resource-synthesizer',
                name: 'Resource Synthesizer',
                description: 'Generates both scrap and energy efficiently',
                level: 0,
                unlockLevel: 9,
                unlocked: false,
                active: false,
                baseCost: { resource: 'Scrap', amount: 800 },
                effects: {
                  scrapProduction: 4,
                  energyProduction: 2,
                  resourceBonus: 0.05
                }
              },
              {
                id: 'quantum-amplifier',
                name: 'Quantum Amplifier',
                description: 'Uses quantum mechanics to boost all production',
                level: 0,
                unlockLevel: 10,
                unlocked: false,
                active: false,
                baseCost: { resource: 'Energy', amount: 1000 },
                effects: {
                  scrapProduction: 3,
                  energyProduction: 3,
                  typingDamageBonus: 0.1,
                  autoAttackBonus: 0.1,
                  resourceBonus: 0.1
                }
              },
              {
                id: 'experience-matrix',
                name: 'Experience Matrix',
                description: 'Enhances experience gain through quantum computing',
                level: 0,
                unlockLevel: 12,
                unlocked: false,
                active: false,
                baseCost: { resource: 'Energy', amount: 1500 },
                effects: {
                  experienceBonus: 0.2,
                  energyProduction: -1
                }
              },
              {
                id: 'ultimate-factory',
                name: 'Ultimate Factory',
                description: 'The pinnacle of factory technology',
                level: 0,
                unlockLevel: 15,
                unlocked: false,
                active: false,
                baseCost: { resource: 'Energy', amount: 2000 },
                effects: {
                  scrapProduction: 10,
                  energyProduction: 5,
                  typingDamageBonus: 0.2,
                  autoAttackBonus: 0.2,
                  experienceBonus: 0.1,
                  resourceBonus: 0.15
                }
              }
            ]
          };
        }
        return persistedState;
      }
    }
  )
); 

// Define initial factories as a constant to use in migrations
const initialFactories = [
  // ... copy all the factories array here ...
]; 