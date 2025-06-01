import { create } from 'zustand';

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
}

interface GameState {
  // Player Stats
  level: number;
  experience: number;
  typingSpeed: number;
  accuracy: number;
  
  // Resources
  resources: Resource[];
  
  // Combat
  wave: number;
  enemies: Enemy[];
  autoAttackDamage: number;
  
  // Factory
  factoryLevel: number;
  productionMultiplier: number;
  
  // Methods
  addExperience: (amount: number) => void;
  updateResource: (resourceName: string, amount: number) => void;
  spawnWave: () => void;
  updateTypingStats: (wpm: number, accuracy: number) => void;
}

export const useGameStore = create<GameState>()((set) => ({
  // Initial State
  level: 1,
  experience: 0,
  typingSpeed: 0,
  accuracy: 0,
  resources: [
    { name: 'Scrap', amount: 0, perSecond: 1 },
    { name: 'Energy', amount: 0, perSecond: 0.5 },
  ],
  wave: 1,
  enemies: [],
  autoAttackDamage: 1,
  factoryLevel: 1,
  productionMultiplier: 1,
  
  // Methods
  addExperience: (amount: number) => set((state) => ({
    experience: state.experience + amount,
    level: Math.floor(state.experience / 1000) + 1,
  })),
  
  updateResource: (resourceName: string, amount: number) => set((state) => ({
    resources: state.resources.map((resource: Resource) =>
      resource.name === resourceName
        ? { ...resource, amount: resource.amount + amount }
        : resource
    ),
  })),
  
  spawnWave: () => set((state) => {
    const newEnemies = Array(state.wave).fill(null).map((_, index) => ({
      id: `enemy-${state.wave}-${index}`,
      health: 50 * state.wave,
      maxHealth: 50 * state.wave,
      damage: 5 * state.wave,
      type: 'zombie',
    }));
    
    return {
      enemies: newEnemies,
      wave: state.wave + 1,
    };
  }),
  
  updateTypingStats: (wpm: number, accuracy: number) => set(() => ({
    typingSpeed: wpm,
    accuracy: accuracy,
  })),
})); 