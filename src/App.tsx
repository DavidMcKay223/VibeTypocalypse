import React, { useState } from 'react';
import { TypingGame } from './components/TypingGame';
import { Factory } from './components/Factory';
import { Combat } from './components/Combat';
import Shop from './components/Shop';
import { useGameStore } from './store/gameStore';

const App: React.FC = () => {
  const [showShop, setShowShop] = useState(false);
  const { 
    level, 
    experience, 
    typingSpeed, 
    accuracy,
    resources 
  } = useGameStore();

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">VibeTypocalypse</h1>
          <button
            onClick={() => setShowShop(!showShop)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold"
          >
            {showShop ? 'Close Shop' : 'Open Shop'}
          </button>
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
        </div>
      )}
    </div>
  );
};

export default App; 