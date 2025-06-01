import React from 'react';
import { TypingGame } from './components/TypingGame';
import { Factory } from './components/Factory';
import { Combat } from './components/Combat';
import { useGameStore } from './store/gameStore';

const App: React.FC = () => {
  const { level, experience, typingSpeed, accuracy } = useGameStore();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">VibeTypocalypse</h1>
        <div className="grid grid-cols-4 gap-4 bg-gray-800 p-4 rounded-lg">
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
        </div>
      </header>

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
      </div>
    </div>
  );
};

export default App; 