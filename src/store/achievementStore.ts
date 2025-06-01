import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // CSS classes for the icon
  requirement: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  autoCollect: boolean; // New property for auto-collecting achievements
  resetOnClaim: boolean; // New property to determine if achievement resets after claiming
  reward: {
    type: 'experience' | 'resource' | 'multiplier';
    amount: number;
    resource?: string;
  };
}

interface AchievementState {
  achievements: Achievement[];
  updateProgress: (id: string, progress: number) => void;
  pendingNotification: Achievement | null;
  clearNotification: () => void;
  resetAllAchievements: () => void; // New reset function
}

// Helper function to get initial achievements state
const getInitialAchievements = (): Achievement[] => [
  // Typing Speed Achievements (Auto-collect)
  {
    id: 'wpm-30',
    name: 'Novice Typist',
    description: 'Reach 30 WPM',
    icon: 'text-green-400 fas fa-keyboard',
    requirement: 30,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: false,
    reward: { type: 'multiplier' as const, amount: 0.1 } // +10% typing damage
  },
  {
    id: 'wpm-50',
    name: 'Skilled Typist',
    description: 'Reach 50 WPM',
    icon: 'text-blue-400 fas fa-keyboard',
    requirement: 50,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: false,
    reward: { type: 'multiplier' as const, amount: 0.2 } // +20% typing damage
  },
  {
    id: 'wpm-80',
    name: 'Expert Typist',
    description: 'Reach 80 WPM',
    icon: 'text-purple-400 fas fa-keyboard',
    requirement: 80,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: false,
    reward: { type: 'multiplier' as const, amount: 0.5 } // +50% typing damage
  },
  
  // Accuracy Achievements
  {
    id: 'accuracy-95',
    name: 'Precision Master',
    description: 'Complete a sequence with 95% accuracy',
    icon: 'text-yellow-400 fas fa-bullseye',
    requirement: 95,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: false,
    resetOnClaim: false,
    reward: { type: 'experience' as const, amount: 1000 }
  },
  
  // Streak Achievements
  {
    id: 'streak-5',
    name: 'Combo Starter',
    description: 'Achieve a 5x streak',
    icon: 'text-orange-400 fas fa-fire',
    requirement: 5,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: false,
    resetOnClaim: false,
    reward: { type: 'resource' as const, amount: 100, resource: 'Scrap' }
  },
  {
    id: 'streak-10',
    name: 'Combo Master',
    description: 'Achieve a 10x streak',
    icon: 'text-red-400 fas fa-fire',
    requirement: 10,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: false,
    resetOnClaim: false,
    reward: { type: 'resource' as const, amount: 200, resource: 'Energy' }
  },
  
  // Word Count Achievements (with reset)
  {
    id: 'words-25',
    name: 'Word Sniper',
    description: 'Type 25 words',
    icon: 'text-gray-400 fas fa-crosshairs',
    requirement: 25,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: true,
    reward: { type: 'experience' as const, amount: 100 }
  },
  {
    id: 'words-50',
    name: 'Word Slinger',
    description: 'Type 50 words',
    icon: 'text-blue-400 fas fa-meteor',
    requirement: 50,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: true,
    reward: { type: 'experience' as const, amount: 250 }
  },
  {
    id: 'words-100',
    name: 'Word Blitzer',
    description: 'Type 100 words',
    icon: 'text-yellow-400 fas fa-bolt',
    requirement: 100,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: true,
    reward: { 
      type: 'resource' as const, 
      amount: 50, 
      resource: 'Scrap' 
    }
  },
  {
    id: 'words-200',
    name: 'Word Tsunami',
    description: 'Type 200 words',
    icon: 'text-blue-500 fas fa-water',
    requirement: 200,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: true,
    reward: { 
      type: 'resource' as const, 
      amount: 75, 
      resource: 'Energy' 
    }
  },
  {
    id: 'words-350',
    name: 'Word Volcano',
    description: 'Type 350 words',
    icon: 'text-red-500 fas fa-fire-alt',
    requirement: 350,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: true,
    reward: {
      type: 'multiplier' as const,
      amount: 0.05 // +5% typing damage
    }
  },
  {
    id: 'words-500',
    name: 'Word Supernova',
    description: 'Type 500 words',
    icon: 'text-purple-400 fas fa-sun',
    requirement: 500,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: true,
    reward: {
      type: 'multiplier' as const,
      amount: 0.1 // +10% typing damage
    }
  },
  {
    id: 'words-750',
    name: 'Word Apocalypse',
    description: 'Type 750 words',
    icon: 'text-red-600 fas fa-skull',
    requirement: 750,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: true,
    reward: {
      type: 'resource' as const,
      amount: 200,
      resource: 'Energy'
    }
  },
  {
    id: 'words-1000',
    name: 'Word God',
    description: 'Type 1000 words',
    icon: 'text-yellow-300 fas fa-crown',
    requirement: 1000,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: true,
    reward: {
      type: 'multiplier' as const,
      amount: 0.15 // +15% typing damage
    }
  },
  
  // Factory Achievements
  {
    id: 'factories-3',
    name: 'Factory Starter',
    description: 'Have 3 active factories',
    icon: 'text-blue-400 fas fa-industry',
    requirement: 3,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: false,
    resetOnClaim: false,
    reward: { type: 'resource' as const, amount: 300, resource: 'Scrap' }
  },
  {
    id: 'factory-level-5',
    name: 'Factory Expert',
    description: 'Get any factory to level 5',
    icon: 'text-purple-400 fas fa-industry',
    requirement: 5,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: false,
    resetOnClaim: false,
    reward: { type: 'resource' as const, amount: 500, resource: 'Energy' }
  },
  
  // Special Achievements (Auto-collect)
  {
    id: 'perfect-run',
    name: 'Perfect Run',
    description: 'Complete a sequence with 100% accuracy and no backspace',
    icon: 'text-yellow-400 fas fa-star',
    requirement: 1,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: false,
    reward: { type: 'multiplier' as const, amount: 0.25 } // +25% typing damage
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a 5-word sequence in under 5 seconds',
    icon: 'text-red-400 fas fa-bolt',
    requirement: 1,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: true,
    resetOnClaim: false,
    reward: { type: 'multiplier' as const, amount: 0.3 } // +30% typing damage
  },

  // New Resource & Money Achievements
  {
    id: 'money-millionaire',
    name: 'Millionaire',
    description: 'Accumulate 1,000,000 money',
    icon: '💰',
    requirement: 1000000,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: false,
    resetOnClaim: false,
    reward: { type: 'experience' as const, amount: 1000000 }
  },
  {
    id: 'money-spender',
    name: 'Big Spender',
    description: 'Spend 500,000 money in the shop',
    icon: '🛍️',
    requirement: 500000,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: false,
    resetOnClaim: false,
    reward: { type: 'experience' as const, amount: 500000 }
  },
  {
    id: 'scrap-hoarder',
    name: 'Scrap Hoarder',
    description: 'Accumulate 100,000 scrap',
    icon: '🔧',
    requirement: 100000,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: false,
    resetOnClaim: false,
    reward: { type: 'resource' as const, amount: 100000, resource: 'Scrap' }
  },
  {
    id: 'energy-master',
    name: 'Energy Master',
    description: 'Accumulate 50,000 energy',
    icon: '⚡',
    requirement: 50000,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: false,
    resetOnClaim: false,
    reward: { type: 'resource' as const, amount: 50000, resource: 'Energy' }
  },
  {
    id: 'resource-production',
    name: 'Resource Baron',
    description: 'Reach 1,000 combined resource production per second',
    icon: '📈',
    requirement: 1000,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: false,
    resetOnClaim: false,
    reward: { type: 'experience' as const, amount: 1000 }
  },
  {
    id: 'arsenal-collector',
    name: 'Arsenal Collector',
    description: 'Own all weapons in the gun shop',
    icon: '🔫',
    requirement: 5,
    progress: 0,
    completed: false,
    claimed: false,
    autoCollect: false,
    resetOnClaim: false,
    reward: { type: 'resource' as const, amount: 5, resource: 'Weapons' }
  }
];

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievements: getInitialAchievements(),
      pendingNotification: null,
      
      updateProgress: (id: string, progress: number) => {
        const state = get();
        const achievement = state.achievements.find(a => a.id === id);
        
        if (achievement && !achievement.claimed) {  // Only update if not already claimed
          // Always update progress even if completed (for progress bar)
          const newProgress = Math.max(0, Math.min(progress, achievement.requirement));
          const wasCompleted = achievement.completed;
          const isNowCompleted = newProgress >= achievement.requirement;
          
          // If achievement is newly completed, auto-collect it
          if (!wasCompleted && isNowCompleted) {
            set({
              achievements: state.achievements.map(a =>
                a.id === id ? {
                  ...a,
                  progress: newProgress,
                  completed: true,
                  claimed: true  // Always mark as claimed when completed
                } : a
              ),
              pendingNotification: { ...achievement, progress: newProgress, completed: true }
            });
          } else if (!isNowCompleted) {
            // Only update progress if not completed
            set({
              achievements: state.achievements.map(a =>
                a.id === id ? {
                  ...a,
                  progress: newProgress
                } : a
              )
            });
          }
        }
      },
      
      clearNotification: () => {
        set({ pendingNotification: null });
      },

      resetAllAchievements: () => {
        set({
          achievements: getInitialAchievements(),
          pendingNotification: null
        });
      }
    }),
    {
      name: 'achievements-storage',
      version: 2  // Increment version to force reset of achievement storage
    }
  )
); 