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
    resource?: { name: string; amount: number };
    levels?: number;
  };
  type: 'typing' | 'factory' | 'combat' | 'prestige';
  effect: {
    stat: string;
    value: number;
    permanent?: boolean;
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
  
  // Methods
  addExperience: (amount: number) => void;
  updateResource: (resourceName: string, amount: number) => void;
  spawnWave: () => void;
  incrementWave: () => void;
  damageEnemy: (enemyId: string, damage: number) => void;
  updateTypingStats: (wpm: number, accuracy: number) => void;
  purchaseUpgrade: (upgradeId: string) => void;
  upgradeFactory: (factoryId: string) => void;
  toggleFactory: (factoryId: string) => void;
  resetGame: () => void;
  calculateAutoAttackDamage: () => number;
  purchaseGun: (gunId: string) => void;
}

interface GameStateUpdates extends Partial<GameState> {
  [key: string]: any;
}

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
      availableUpgrades: [
        // Resource-based upgrades
        {
          id: 'typing-speed-1',
          name: 'Swift Fingers',
          description: 'Increase typing damage by 25%',
          cost: { resource: { name: 'Scrap', amount: 100 } },
          type: 'typing',
          effect: { stat: 'typingDamageMultiplier', value: 1.25 },
          purchased: false
        },
        {
          id: 'factory-1',
          name: 'Advanced Automation',
          description: 'Increase factory production by 50%',
          cost: { resource: { name: 'Energy', amount: 150 } },
          type: 'factory',
          effect: { stat: 'productionMultiplier', value: 1.5 },
          purchased: false
        },
        {
          id: 'combat-1',
          name: 'Auto-Turret',
          description: 'Double auto-attack damage',
          cost: { resource: { name: 'Scrap', amount: 200 } },
          type: 'combat',
          effect: { stat: 'autoAttackDamage', value: 2 },
          purchased: false
        },

        // Level-based prestige upgrades
        {
          id: 'prestige-typing-mastery',
          name: 'Typing Mastery',
          description: 'Sacrifice 5 levels to permanently increase typing damage by 100%',
          cost: { levels: 5 },
          type: 'prestige',
          requiresLevel: 10,
          effect: { 
            stat: 'typingDamageMultiplier', 
            value: 2,
            permanent: true
          },
          purchased: false
        },
        {
          id: 'prestige-resource-mastery',
          name: 'Resource Mastery',
          description: 'Sacrifice 8 levels to permanently increase all resource generation by 150%',
          cost: { levels: 8 },
          type: 'prestige',
          requiresLevel: 15,
          effect: { 
            stat: 'productionMultiplier', 
            value: 2.5,
            permanent: true
          },
          purchased: false
        },
        {
          id: 'prestige-combat-mastery',
          name: 'Combat Mastery',
          description: 'Sacrifice 10 levels to permanently increase auto-attack damage by 200%',
          cost: { levels: 10 },
          type: 'prestige',
          requiresLevel: 20,
          effect: { 
            stat: 'autoAttackDamage', 
            value: 3,
            permanent: true
          },
          purchased: false
        },
        {
          id: 'prestige-exp-boost',
          name: 'Experience Mastery',
          description: 'Sacrifice 12 levels to permanently gain 50% more experience from all sources',
          cost: { levels: 12 },
          type: 'prestige',
          requiresLevel: 25,
          effect: { 
            stat: 'experienceMultiplier', 
            value: 1.5,
            permanent: true
          },
          purchased: false
        },
        {
          id: 'prestige-quantum-mastery',
          name: 'Quantum Mastery',
          description: 'Sacrifice 15 levels to permanently increase ALL damage and production by 100%',
          cost: { levels: 15 },
          type: 'prestige',
          requiresLevel: 30,
          effect: { 
            stat: 'globalMultiplier', 
            value: 2,
            permanent: true
          },
          purchased: false
        }
      ],
      
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
        // Calculate total resource bonus from factories
        const resourceBonus = state.factories.reduce((bonus, factory) => {
          if (factory.active && factory.effects.resourceBonus) {
            return bonus + (factory.effects.resourceBonus * factory.level);
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
                  amount: resource.amount + (amount * resourceBonus),
                  perSecond: resourceRates[resource.name as keyof typeof resourceRates]
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
        
        // Calculate bonus from factories
        const autoAttackBonus = state.factories.reduce((bonus, factory) => {
          if (factory.active && factory.effects.autoAttackBonus) {
            return bonus + (factory.effects.autoAttackBonus * factory.level);
          }
          return bonus;
        }, 0);

        // Apply gun bonuses
        const gunBonus = state.purchasedGuns.reduce((bonus, gunId) => {
          const gun = gunUpgrades.find(g => g.id === gunId);
          return bonus + (gun?.damageBonus || 0);
        }, 0);

        return baseAutoAttackDamage * (1 + autoAttackBonus + gunBonus);
      },

      spawnWave: () => set(state => {
        const baseHealth = 50;
        const healthScaling = 1.15; // 15% increase per wave
        const waveHealthMultiplier = Math.pow(healthScaling, state.wave - 1);
        
        const newEnemies = Array(state.wave).fill(null).map((_, index) => ({
          id: `enemy-${state.wave}-${index}`,
          health: Math.floor(baseHealth * waveHealthMultiplier * state.wave),
          maxHealth: Math.floor(baseHealth * waveHealthMultiplier * state.wave),
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

      purchaseUpgrade: (upgradeId: string) => set((state) => {
        const upgrade = state.availableUpgrades.find(u => u.id === upgradeId);
        if (!upgrade || upgrade.purchased) return state;

        // Check if we can afford the upgrade
        if (upgrade.cost.resource) {
          const { name, amount } = upgrade.cost.resource;
          const resource = state.resources.find(r => r.name === name);
          if (!resource || resource.amount < amount) return state;
        }

        if (upgrade.cost.levels) {
          const requiredLevel = upgrade.requiresLevel || 0;
          if (state.level < requiredLevel || state.level - upgrade.cost.levels < 1) {
            return state;
          }
        }

        // Create new state with updates
        const updates: GameStateUpdates = {
          availableUpgrades: state.availableUpgrades.map(u =>
            u.id === upgradeId ? { ...u, purchased: true } : u
          ),
        };

        // Apply resource cost
        if (upgrade.cost.resource) {
          const { name, amount } = upgrade.cost.resource;
          updates.resources = state.resources.map(r =>
            r.name === name
              ? { ...r, amount: r.amount - amount }
              : r
          );
        }

        // Apply level cost
        if (upgrade.cost.levels) {
          updates.level = state.level - upgrade.cost.levels;
          updates.experience = 0; // Reset experience when sacrificing levels
        }

        // Apply upgrade effects
        const currentState = state as Record<string, any>;
        if (upgrade.effect.stat === 'globalMultiplier') {
          updates.typingDamageMultiplier = (state.typingDamageMultiplier || 1) * upgrade.effect.value;
          updates.productionMultiplier = (state.productionMultiplier || 1) * upgrade.effect.value;
          updates.autoAttackDamage = (state.autoAttackDamage || 1) * upgrade.effect.value;
        } else {
          const currentValue = currentState[upgrade.effect.stat] || 1;
          updates[upgrade.effect.stat] = currentValue * upgrade.effect.value;
        }

        return updates as GameState;
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
          availableUpgrades: [
            {
              id: 'typing-speed-1',
              name: 'Swift Fingers',
              description: 'Increase typing damage by 25%',
              cost: { resource: { name: 'Scrap', amount: 100 } },
              type: 'typing',
              effect: { stat: 'typingDamageMultiplier', value: 1.25 },
              purchased: false
            },
            {
              id: 'factory-1',
              name: 'Advanced Automation',
              description: 'Increase factory production by 50%',
              cost: { resource: { name: 'Energy', amount: 150 } },
              type: 'factory',
              effect: { stat: 'productionMultiplier', value: 1.5 },
              purchased: false
            },
            {
              id: 'combat-1',
              name: 'Auto-Turret',
              description: 'Double auto-attack damage',
              cost: { resource: { name: 'Scrap', amount: 200 } },
              type: 'combat',
              effect: { stat: 'autoAttackDamage', value: 2 },
              purchased: false
            },
            {
              id: 'prestige-typing-mastery',
              name: 'Typing Mastery',
              description: 'Sacrifice 5 levels to permanently increase typing damage by 100%',
              cost: { levels: 5 },
              type: 'prestige',
              requiresLevel: 10,
              effect: { 
                stat: 'typingDamageMultiplier', 
                value: 2,
                permanent: true
              },
              purchased: false
            },
            {
              id: 'prestige-resource-mastery',
              name: 'Resource Mastery',
              description: 'Sacrifice 8 levels to permanently increase all resource generation by 150%',
              cost: { levels: 8 },
              type: 'prestige',
              requiresLevel: 15,
              effect: { 
                stat: 'productionMultiplier', 
                value: 2.5,
                permanent: true
              },
              purchased: false
            },
            {
              id: 'prestige-combat-mastery',
              name: 'Combat Mastery',
              description: 'Sacrifice 10 levels to permanently increase auto-attack damage by 200%',
              cost: { levels: 10 },
              type: 'prestige',
              requiresLevel: 20,
              effect: { 
                stat: 'autoAttackDamage', 
                value: 3,
                permanent: true
              },
              purchased: false
            },
            {
              id: 'prestige-exp-boost',
              name: 'Experience Mastery',
              description: 'Sacrifice 12 levels to permanently gain 50% more experience from all sources',
              cost: { levels: 12 },
              type: 'prestige',
              requiresLevel: 25,
              effect: { 
                stat: 'experienceMultiplier', 
                value: 1.5,
                permanent: true
              },
              purchased: false
            },
            {
              id: 'prestige-quantum-mastery',
              name: 'Quantum Mastery',
              description: 'Sacrifice 15 levels to permanently increase ALL damage and production by 100%',
              cost: { levels: 15 },
              type: 'prestige',
              requiresLevel: 30,
              effect: { 
                stat: 'globalMultiplier', 
                value: 2,
                permanent: true
              },
              purchased: false
            }
          ]
        });
      },

      incrementWave: () => set(state => ({ wave: state.wave + 1 })),

      damageEnemy: (enemyId: string, damage: number) => set(state => {
        const enemy = state.enemies.find(e => e.id === enemyId);
        if (!enemy) return state;

        const updatedEnemies = state.enemies.map(e => {
          if (e.id === enemyId) {
            const newHealth = Math.max(0, e.health - damage);
            return { ...e, health: newHealth };
          }
          return e;
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