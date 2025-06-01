import React from 'react';
import { useAchievementStore, Achievement } from '../store/achievementStore';
import { useGameStore } from '../store/gameStore';

export const Achievements: React.FC = () => {
  const { achievements, claimReward } = useAchievementStore();
  const { addExperience, updateResource, typingDamageMultiplier } = useGameStore();

  const handleClaimReward = (achievement: Achievement) => {
    if (achievement.completed && claimReward(achievement.id)) {
      switch (achievement.reward.type) {
        case 'experience':
          addExperience(achievement.reward.amount);
          break;
        case 'resource':
          if (achievement.reward.resource) {
            updateResource(achievement.reward.resource, achievement.reward.amount);
          }
          break;
        case 'multiplier':
          // The multiplier is automatically applied through the store
          break;
      }
    }
  };

  const getProgressColor = (achievement: Achievement) => {
    const progress = (achievement.progress / achievement.requirement) * 100;
    if (achievement.completed) return 'bg-green-500';
    if (progress >= 75) return 'bg-yellow-500';
    if (progress >= 50) return 'bg-orange-500';
    if (progress >= 25) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const formatProgress = (achievement: Achievement) => {
    if (achievement.completed) return 'Completed!';
    return `${Math.min(achievement.progress, achievement.requirement)} / ${achievement.requirement}`;
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Achievements</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map(achievement => (
          <div
            key={achievement.id}
            className={`bg-gray-700 rounded-lg p-4 ${
              achievement.completed ? 'border-2 border-green-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <i className={`${achievement.icon} text-2xl mr-2`}></i>
                <h3 className="text-lg font-semibold text-white">
                  {achievement.name}
                </h3>
              </div>
              {achievement.completed && !achievement.claimed && (
                <button
                  onClick={() => handleClaimReward(achievement)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 rounded text-sm text-white"
                >
                  Claim
                </button>
              )}
            </div>
            
            <p className="text-gray-300 text-sm mb-2">{achievement.description}</p>
            
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-gray-300">
                    {formatProgress(achievement)}
                  </span>
                </div>
              </div>
              <div className="flex h-2 mb-4 overflow-hidden bg-gray-800 rounded">
                <div
                  style={{
                    width: `${Math.min(
                      (achievement.progress / achievement.requirement) * 100,
                      100
                    )}%`,
                  }}
                  className={`${getProgressColor(achievement)} transition-all duration-300`}
                ></div>
              </div>
            </div>

            <div className="text-sm">
              <span className="text-gray-400">Reward: </span>
              <span className={`
                ${achievement.reward.type === 'experience' ? 'text-yellow-400' : ''}
                ${achievement.reward.type === 'resource' ? 'text-blue-400' : ''}
                ${achievement.reward.type === 'multiplier' ? 'text-purple-400' : ''}
              `}>
                {achievement.reward.type === 'experience' && `${achievement.reward.amount} EXP`}
                {achievement.reward.type === 'resource' && `${achievement.reward.amount} ${achievement.reward.resource}`}
                {achievement.reward.type === 'multiplier' && `+${achievement.reward.amount * 100}% Typing Damage`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 