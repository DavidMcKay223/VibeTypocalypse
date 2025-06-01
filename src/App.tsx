import React, { useState } from 'react';
import { TypingGame } from './components/TypingGame';
import { Factory } from './components/Factory';
import { Combat } from './components/Combat';
import Shop from './components/Shop';
import { GunShop } from './components/GunShop';
import { Achievements } from './components/Achievements';
import { useGameStore } from './store/gameStore';
import { useAchievementStore } from './store/achievementStore';
import { AchievementNotification } from './components/AchievementNotification';

const App: React.FC = () => {
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const { 
    level, 
    experience, 
    typingSpeed, 
    accuracy,
    resources,
    resetGame,
    calculateAutoAttackDamage
  } = useGameStore();
  
  const { pendingNotification, clearNotification } = useAchievementStore();

  const handleReset = () => {
    resetGame();
    setShowResetConfirm(false);
    setShowShop(false);
    setShowAchievements(false);
  };

  const autoAttackDamage = calculateAutoAttackDamage();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {pendingNotification && (
        <AchievementNotification
          achievement={pendingNotification}
          onComplete={clearNotification}
        />
      )}
      
      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Reset Game?</h3>
            <p className="text-gray-300 mb-6">
              This will reset your game progress to level 1 and clear all achievements. 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
              >
                Reset Game
              </button>
            </div>
          </div>
        </div>
      )}
      
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">VibeTypocalypse</h1>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setShowShop(false);
                setShowAchievements(!showAchievements);
              }}
              className={`px-4 py-2 rounded-lg font-semibold ${
                showAchievements 
                  ? 'bg-yellow-600 hover:bg-yellow-700' 
                  : 'bg-yellow-700 hover:bg-yellow-800'
              }`}
            >
              {showAchievements ? 'Close Achievements' : 'Achievements'}
            </button>
            <button
              onClick={() => {
                setShowAchievements(false);
                setShowShop(!showShop);
              }}
              className={`px-4 py-2 rounded-lg font-semibold ${
                showShop 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-700 hover:bg-blue-800'
              }`}
            >
              {showShop ? 'Close Shop' : 'Shop'}
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 rounded-lg font-semibold bg-red-700 hover:bg-red-800"
            >
              Reset Game
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 bg-gray-800 p-4 rounded-lg">
          <div>
            <div className="text-gray-400">Level</div>
            <div className="text-xl">{level}</div>
          </div>
          <div>
            <div className="text-gray-400">Experience</div>
            <div className="text-xl">{experience}</div>
          </div>
          <div>
            <div className="text-gray-400">Typing Speed</div>
            <div className="text-xl">{typingSpeed} WPM</div>
          </div>
          <div>
            <div className="text-gray-400">Accuracy</div>
            <div className="text-xl">{accuracy}%</div>
          </div>
          <div>
            <div className="text-gray-400">Auto Attack</div>
            <div className="text-xl text-yellow-400">{Math.floor(autoAttackDamage)} DMG</div>
          </div>
          {resources.map(resource => (
            <div key={resource.name}>
              <div className="text-gray-400">{resource.name}</div>
              <div className="text-xl">{Math.floor(resource.amount)}</div>
              <div className="text-sm text-gray-400">+{resource.perSecond}/s</div>
            </div>
          ))}
        </div>
      </header>

      {showShop ? (
        <div className="mb-8">
          <Shop />
        </div>
      ) : showAchievements ? (
        <div className="mb-8">
          <Achievements />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <TypingGame />
          </div>
          <div>
            <Combat />
          </div>
          <div className="lg:col-span-3">
            <Factory />
          </div>
          <div className="lg:col-span-3">
            <GunShop />
          </div>
        </div>
      )}
    </div>
  );
};

export default App; 