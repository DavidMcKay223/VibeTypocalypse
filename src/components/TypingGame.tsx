import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

const words = [
  'zombie', 'apocalypse', 'survival', 'defense', 'factory',
  'resource', 'energy', 'scrap', 'weapon', 'upgrade',
  'automation', 'production', 'efficiency', 'power', 'wave'
];

export const TypingGame: React.FC = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const { updateTypingStats, addExperience } = useGameStore();

  const getRandomWord = useCallback(() => {
    return words[Math.floor(Math.random() * words.length)];
  }, []);

  useEffect(() => {
    setCurrentWord(getRandomWord());
  }, [getRandomWord]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);

    if (!startTime) {
      setStartTime(Date.now());
    }

    if (value === currentWord) {
      // Word completed
      const newWordCount = wordCount + 1;
      setWordCount(newWordCount);
      
      if (startTime) {
        const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
        const wpm = Math.round(newWordCount / timeElapsed);
        const accuracy = 100; // Simple accuracy for now
        updateTypingStats(wpm, accuracy);
        addExperience(10); // Reward for completing a word
      }

      setUserInput('');
      setCurrentWord(getRandomWord());
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Typing Defense</h2>
      <div className="mb-4">
        <div className="text-2xl font-mono text-green-400 mb-2">
          {currentWord}
        </div>
        <input
          type="text"
          value={userInput}
          onChange={handleInput}
          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-green-500"
          placeholder="Type the word..."
        />
      </div>
      <div className="text-gray-300">
        Words completed: {wordCount}
      </div>
    </div>
  );
}; 