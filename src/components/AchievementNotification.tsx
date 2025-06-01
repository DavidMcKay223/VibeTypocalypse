import React, { useEffect, useState } from 'react';
import { Achievement } from '../store/achievementStore';

interface NotificationProps {
  achievement: Achievement;
  onComplete: () => void;
}

export const AchievementNotification: React.FC<NotificationProps> = ({ achievement, onComplete }) => {
  const [show, setShow] = useState(false);
  const [confetti, setConfetti] = useState<{ x: number; y: number; color: string }[]>([]);

  useEffect(() => {
    // Create confetti particles
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: ['#FFD700', '#FFA500', '#FF69B4', '#00FF00', '#4169E1'][Math.floor(Math.random() * 5)]
    }));
    
    // Show notification with animation
    setShow(true);
    setConfetti(particles);

    // Hide after 3 seconds
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 300); // Allow exit animation to complete
    }, 3000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed top-4 right-4 transition-all duration-300 transform ${
        show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="relative bg-gray-800 rounded-lg p-4 shadow-lg border-2 border-yellow-500 min-w-[300px]">
        {/* Confetti effect */}
        {confetti.map((particle, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-confetti"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              backgroundColor: particle.color,
              animation: `confetti 1s ease-out forwards`,
              animationDelay: `${Math.random() * 0.5}s`
            }}
          />
        ))}
        
        {/* Achievement icon and details */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
            <i className={`${achievement.icon} text-2xl`}></i>
          </div>
          <div className="flex-grow">
            <h3 className="font-bold text-yellow-400 text-lg mb-1">Achievement Unlocked!</h3>
            <p className="text-white font-semibold">{achievement.name}</p>
            <p className="text-gray-300 text-sm">{achievement.description}</p>
          </div>
        </div>
        
        {/* Reward display */}
        <div className="mt-2 text-sm">
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
    </div>
  );
}; 