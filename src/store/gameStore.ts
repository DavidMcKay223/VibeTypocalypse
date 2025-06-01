import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAchievementStore } from './achievementStore';

interface Resource {
  name: string;
  amount: number;
  perSecond: number;
}

interface Enemy {
  id: string;
  health: number;
  maxHealth: number;
  damage: number;
  type: string;
  reward: number;
}

interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: { 
    resource?: { 
      name: string; 
      amount: number; 
    } | undefined;
    levels?: number | undefined;
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

interface Factory {
  id: string;
  name: string;
  description: string;
  unlockLevel: number;
  unlocked: boolean;
  active: boolean;
  level: number;
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

interface ShopItem {
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

interface GameState {
  // Player Stats
  level: number;
  experience: number;
  typingSpeed: number;
  accuracy: number;
  money: number;
  
  // Resources
  resources: Resource[];
  
  // Combat
  wave: number;
  enemies: Enemy[];
  autoAttackDamage: number;
  baseDamage: number;
  
  // Factory
  factories: Factory[];
  productionMultiplier: number;
  
  // Shop
  availableUpgrades: Upgrade[];
  typingDamageMultiplier: number;
  purchasedGuns: string[];
  
  // Buffs
  activeBuffs: {
    id: string;
    type: string;
    multiplier: number;
    endTime: number;
  }[];
  permanentMultipliers: {
    damage: number;
    resource: number;
    experience: number;
    money: number;
    all: number;
  };
  
  // Methods
  addExperience: (amount: number) => void;
  updateResource: (resourceName: string, amount: number) => void;
  spawnWave: () => void;
  incrementWave: () => void;
  damageEnemy: (enemyId: string, damage: number, splashCount?: number) => void;
  updateTypingStats: (wpm: number, accuracy: number) => void;
  purchaseUpgrade: (upgradeId: string) => void;
  upgradeFactory: (factoryId: string) => void;
  toggleFactory: (factoryId: string) => void;
  resetGame: () => void;
  calculateAutoAttackDamage: () => number;
  purchaseGun: (gunId: string) => void;
  applyBuff: (buffId: string, type: string, multiplier: number, duration: number) => void;
  removeBuff: (buffId: string) => void;
  getActiveBuffMultiplier: (type: string) => number;
}

interface GameStateUpdates extends Partial<GameState> {
  [key: string]: any;
}

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
    requiresLevel: 15,
    effect: { type: 'resource', multiplier: 2.5 },
    purchased: false
  },
  {
    id: 'prestige-combat-mastery',
    name: 'Combat Mastery',
    description: 'Sacrifice 10 levels to permanently increase auto-attack damage by 200%',
    cost: { levels: 10 },
    type: 'prestige',
    requiresLevel: 20,
    effect: { type: 'damage', multiplier: 3 },
    purchased: false
  },
  {
    id: 'prestige-exp-boost',
    name: 'Experience Mastery',
    description: 'Sacrifice 12 levels to permanently gain 50% more experience from all sources',
    cost: { levels: 12 },
    type: 'prestige',
    requiresLevel: 25,
    effect: { type: 'experience', multiplier: 1.5 },
    purchased: false
  },
  {
    id: 'prestige-quantum-mastery',
    name: 'Quantum Mastery',
    description: 'Sacrifice 15 levels to permanently increase ALL damage and production by 100%',
    cost: { levels: 15 },
    type: 'prestige',
    requiresLevel: 30,
    effect: { type: 'all', multiplier: 2 },
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
      permanentMultipliers: {
        damage: 1,
        resource: 1,
        experience: 1,
        money: 1,
        all: 1
      },

      // Factories
      factories: [
        {
          id: 'basic-factory',
          name: 'Basic Factory',
          description: 'Standard resource production',
          unlockLevel: 1,
          unlocked: true,
          active: true,
          level: 1,
          baseCost: { resource: 'Scrap', amount: 100 },
          effects: {
            scrapProduction: 1,
            energyProduction: 0.5
          }
        },
        {
          id: 'quantum-processor',
          name: 'Quantum Processor',
          description: 'Boosts typing damage by 10% per level',
          unlockLevel: 3,
          unlocked: false,
          active: false,
          level: 0,
          baseCost: { resource: 'Energy', amount: 200 },
          effects: {
            typingDamageBonus: 0.1,
            energyProduction: 1
          }
        },
        {
          id: 'auto-turret',
          name: 'Auto-Turret Factory',
          description: 'Increases auto-attack damage by 15% per level',
          unlockLevel: 5,
          unlocked: false,
          active: false,
          level: 0,
          baseCost: { resource: 'Scrap', amount: 300 },
          effects: {
            autoAttackBonus: 0.15,
            scrapProduction: 0.5
          }
        },
        {
          id: 'exp-synthesizer',
          name: 'Experience Synthesizer',
          description: 'Generates bonus experience from typing',
          unlockLevel: 7,
          unlocked: false,
          active: false,
          level: 0,
          baseCost: { resource: 'Energy', amount: 400 },
          effects: {
            experienceBonus: 0.2,
            energyProduction: 0.3
          }
        },
        {
          id: 'resource-amplifier',
          name: 'Resource Amplifier',
          description: 'Increases all resource production by 20% per level',
          unlockLevel: 10,
          unlocked: false,
          active: false,
          level: 0,
          baseCost: { resource: 'Scrap', amount: 500 },
          effects: {
            resourceBonus: 0.2
          }
        },
        {
          id: 'neural-network',
          name: 'Neural Network Factory',
          description: 'Boosts both typing and auto-attack damage',
          unlockLevel: 12,
          unlocked: false,
          active: false,
          level: 0,
          baseCost: { resource: 'Energy', amount: 600 },
          effects: {
            typingDamageBonus: 0.08,
            autoAttackBonus: 0.08
          }
        },
        {
          id: 'matter-converter',
          name: 'Matter Converter',
          description: 'High scrap production with energy cost',
          unlockLevel: 15,
          unlocked: false,
          active: false,
          level: 0,
          baseCost: { resource: 'Energy', amount: 700 },
          effects: {
            scrapProduction: 3,
            energyProduction: -0.5
          }
        },
        {
          id: 'energy-reactor',
          name: 'Energy Reactor',
          description: 'High energy production with scrap cost',
          unlockLevel: 15,
          unlocked: false,
          active: false,
          level: 0,
          baseCost: { resource: 'Scrap', amount: 700 },
          effects: {
            energyProduction: 3,
            scrapProduction: -0.5
          }
        },
        {
          id: 'quantum-entangler',
          name: 'Quantum Entangler',
          description: 'Synergizes all other factories, boosting their effects',
          unlockLevel: 20,
          unlocked: false,
          active: false,
          level: 0,
          baseCost: { resource: 'Energy', amount: 1000 },
          effects: {
            resourceBonus: 0.1,
            typingDamageBonus: 0.05,
            autoAttackBonus: 0.05,
            experienceBonus: 0.1
          }
        },
        {
          id: 'temporal-accelerator',
          name: 'Temporal Accelerator',
          description: 'Increases resource generation speed over time',
          unlockLevel: 25,
          unlocked: false,
          active: false,
          level: 0,
          baseCost: { resource: 'Scrap', amount: 1500 },
          effects: {
            resourceBonus: 0.25,
            energyProduction: -1
          }
        }
      ],
      
      // Shop
      availableUpgrades: initialUpgrades,
      
      // Methods
      addExperience: (amount: number) => set((state) => {
        const newExperience = state.experience + amount;
        
        // New level calculation: Each level requires 100 * level experience
        const currentLevelExp = 100 * state.level;
        const newLevel = newExperience >= currentLevelExp ? state.level + 1 : state.level;
        
        // Check for factory unlocks
        const updatedFactories = state.factories.map(factory => ({
          ...factory,
          unlocked: factory.unlockLevel <= newLevel
        }));

        return {
          experience: newLevel > state.level ? 0 : newExperience, // Reset exp on level up
          level: newLevel,
          factories: updatedFactories
        };
      }),

      updateResource: (resourceName: string, amount: number) => set((state) => {
        const buffMultiplier = state.getActiveBuffMultiplier('resource');
        
        // Calculate total resource bonus from factories
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

        return {
          resources: state.resources.map(resource =>
            resource.name === resourceName
              ? { 
                  ...resource, 
                  amount: resource.amount + (amount * resourceBonus * buffMultiplier)
                }
              : {
                  ...resource,
                  perSecond: resourceRates[resource.name as keyof typeof resourceRates]
                }
          )
        };
      }),

      // Helper to calculate total auto attack damage including bonuses
      calculateAutoAttackDamage: () => {
        const state = get();
        const baseAutoAttackDamage = state.baseDamage;
        
        // Calculate bonus from factories (multiplicative)
        const autoAttackBonus = state.factories.reduce((bonus, factory) => {
          if (factory.active && factory.effects.autoAttackBonus) {
            return bonus * (1 + factory.effects.autoAttackBonus * factory.level);
          }
          return bonus;
        }, 1);

        // Apply gun bonuses (multiplicative)
        const gunBonus = state.purchasedGuns.reduce((bonus, gunId) => {
          const gun = gunUpgrades.find(g => g.id === gunId);
          return bonus * (1 + (gun?.damageBonus || 0) / 100);
        }, 1);

        // Apply active buffs and permanent multipliers
        const buffMultiplier = state.getActiveBuffMultiplier('damage');

        return Math.floor(baseAutoAttackDamage * autoAttackBonus * gunBonus * buffMultiplier);
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

      upgradeFactory: (factoryId: string) => set((state) => {
        const factory = state.factories.find(f => f.id === factoryId);
        if (!factory || !factory.unlocked) return state;

        const cost = factory.baseCost.amount * (factory.level + 1);
        const resource = state.resources.find(r => r.name === factory.baseCost.resource);
        
        if (!resource || resource.amount < cost) return state;

        // Update resource
        const updatedResources = state.resources.map(r =>
          r.name === factory.baseCost.resource
            ? { ...r, amount: r.amount - cost }
            : r
        );

        // Update factory level
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

      toggleFactory: (factoryId: string) => set((state) => ({
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
          factories: [
            {
              id: 'basic-factory',
              name: 'Basic Factory',
              description: 'Standard resource production',
              unlockLevel: 1,
              unlocked: true,
              active: true,
              level: 1,
              baseCost: { resource: 'Scrap', amount: 100 },
              effects: {
                scrapProduction: 1,
                energyProduction: 0.5
              }
            },
            {
              id: 'quantum-processor',
              name: 'Quantum Processor',
              description: 'Boosts typing damage by 10% per level',
              unlockLevel: 3,
              unlocked: false,
              active: false,
              level: 0,
              baseCost: { resource: 'Energy', amount: 200 },
              effects: {
                typingDamageBonus: 0.1,
                energyProduction: 1
              }
            },
            {
              id: 'auto-turret',
              name: 'Auto-Turret Factory',
              description: 'Increases auto-attack damage by 15% per level',
              unlockLevel: 5,
              unlocked: false,
              active: false,
              level: 0,
              baseCost: { resource: 'Scrap', amount: 300 },
              effects: {
                autoAttackBonus: 0.15,
                scrapProduction: 0.5
              }
            },
            {
              id: 'exp-synthesizer',
              name: 'Experience Synthesizer',
              description: 'Generates bonus experience from typing',
              unlockLevel: 7,
              unlocked: false,
              active: false,
              level: 0,
              baseCost: { resource: 'Energy', amount: 400 },
              effects: {
                experienceBonus: 0.2,
                energyProduction: 0.3
              }
            },
            {
              id: 'resource-amplifier',
              name: 'Resource Amplifier',
              description: 'Increases all resource production by 20% per level',
              unlockLevel: 10,
              unlocked: false,
              active: false,
              level: 0,
              baseCost: { resource: 'Scrap', amount: 500 },
              effects: {
                resourceBonus: 0.2
              }
            },
            {
              id: 'neural-network',
              name: 'Neural Network Factory',
              description: 'Boosts both typing and auto-attack damage',
              unlockLevel: 12,
              unlocked: false,
              active: false,
              level: 0,
              baseCost: { resource: 'Energy', amount: 600 },
              effects: {
                typingDamageBonus: 0.08,
                autoAttackBonus: 0.08
              }
            },
            {
              id: 'matter-converter',
              name: 'Matter Converter',
              description: 'High scrap production with energy cost',
              unlockLevel: 15,
              unlocked: false,
              active: false,
              level: 0,
              baseCost: { resource: 'Energy', amount: 700 },
              effects: {
                scrapProduction: 3,
                energyProduction: -0.5
              }
            },
            {
              id: 'energy-reactor',
              name: 'Energy Reactor',
              description: 'High energy production with scrap cost',
              unlockLevel: 15,
              unlocked: false,
              active: false,
              level: 0,
              baseCost: { resource: 'Scrap', amount: 700 },
              effects: {
                energyProduction: 3,
                scrapProduction: -0.5
              }
            },
            {
              id: 'quantum-entangler',
              name: 'Quantum Entangler',
              description: 'Synergizes all other factories, boosting their effects',
              unlockLevel: 20,
              unlocked: false,
              active: false,
              level: 0,
              baseCost: { resource: 'Energy', amount: 1000 },
              effects: {
                resourceBonus: 0.1,
                typingDamageBonus: 0.05,
                autoAttackBonus: 0.05,
                experienceBonus: 0.1
              }
            },
            {
              id: 'temporal-accelerator',
              name: 'Temporal Accelerator',
              description: 'Increases resource generation speed over time',
              unlockLevel: 25,
              unlocked: false,
              active: false,
              level: 0,
              baseCost: { resource: 'Scrap', amount: 1500 },
              effects: {
                resourceBonus: 0.25,
                energyProduction: -1
              }
            }
          ],
          availableUpgrades: initialUpgrades
        });
      },

      incrementWave: () => set(state => ({ wave: state.wave + 1 })),

      damageEnemy: (enemyId: string, damage: number, splashCount: number = 3) => set(state => {
        // Get target enemy and nearby enemies (up to splashCount total)
        const targetIndex = state.enemies.findIndex(e => e.id === enemyId);
        if (targetIndex === -1) return state;

        // Get indices for splash damage (enemies before and after the target)
        const splashIndices = new Set<number>([targetIndex]);
        let before = targetIndex - 1;
        let after = targetIndex + 1;
        
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

        const updatedEnemies = state.enemies.map((enemy, index) => {
          if (splashIndices.has(index)) {
            // Main target takes full damage, others take 50% splash damage
            const damageAmount = index === targetIndex ? damage : damage * 0.5;
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

        // If all enemies are cleared, increment wave
        if (remainingEnemies.length === 0) {
          return {
            enemies: remainingEnemies,
            wave: state.wave + 1,
            experience: state.experience + expReward,
            money: state.money + moneyReward,
            resources: state.resources.map(resource => ({
              ...resource,
              amount: resource.amount + resourceReward
            }))
          };
        }

        return { 
          enemies: remainingEnemies,
          money: state.money + moneyReward,
          experience: state.experience + expReward,
          resources: state.resources.map(resource => ({
            ...resource,
            amount: resource.amount + resourceReward
          }))
        };
      }),

      purchaseGun: (gunId: string) => set(state => {
        const gun = gunUpgrades.find(g => g.id === gunId);
        if (!gun || state.purchasedGuns.includes(gunId) || state.money < gun.cost) {
          return state;
        }

        return {
          money: state.money - gun.cost,
          purchasedGuns: [...state.purchasedGuns, gunId],
          baseDamage: state.baseDamage + gun.damageBonus
        };
      }),

      applyBuff: (buffId: string, type: string, multiplier: number, duration: number) => 
        set(state => {
          const now = Date.now();
          
          // Remove expired buffs
          const activeBuffs = state.activeBuffs.filter(buff => buff.endTime > now);
          
          // Check if a buff of this type already exists
          const existingBuff = activeBuffs.find(buff => buff.type === type);
          if (existingBuff) {
            // Replace the existing buff with the new one
            return {
              activeBuffs: [
                ...activeBuffs.filter(buff => buff.type !== type),
                {
                  id: buffId,
                  type,
                  multiplier,
                  endTime: now + duration * 1000
                }
              ]
            };
          }

          // Add new buff
          return {
            activeBuffs: [
              ...activeBuffs,
              {
                id: buffId,
                type,
                multiplier,
                endTime: now + duration * 1000
              }
            ]
          };
        }),

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
    }),
    {
      name: 'game-storage'
    }
  )
);

// Gun upgrade definitions
export const gunUpgrades = [
  {
    id: 'pistol',
    name: 'Pistol',
    description: 'Basic sidearm (+5 damage)',
    cost: 100,
    damageBonus: 5
  },
  {
    id: 'shotgun',
    name: 'Shotgun',
    description: 'Powerful short-range weapon (+15 damage)',
    cost: 500,
    damageBonus: 15
  },
  {
    id: 'rifle',
    name: 'Assault Rifle',
    description: 'Rapid-fire weapon (+30 damage)',
    cost: 2000,
    damageBonus: 30
  },
  {
    id: 'sniper',
    name: 'Sniper Rifle',
    description: 'High-powered precision weapon (+50 damage)',
    cost: 5000,
    damageBonus: 50
  },
  {
    id: 'plasma',
    name: 'Plasma Cannon',
    description: 'Advanced energy weapon (+100 damage)',
    cost: 15000,
    damageBonus: 100
  }
]; 