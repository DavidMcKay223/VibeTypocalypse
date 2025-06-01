import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { useAchievementStore } from '../store/achievementStore';

const wordCategories = {
  'AI and ML': [0, 31],
  'Programming': [32, 63],
  'Web Dev': [64, 95],
  'Dev Tools': [96, 127],
  'Cyberpunk': [128, 159],
  'Architecture': [160, 191],
  'Databases': [192, 223],
  'Game Dev': [224, 255],
  'Zombies': [256, 287]
};

const words = [
  // AI and Machine Learning
  'neural', 'network', 'deep', 'learning', 'algorithm', 'dataset', 'training',
  'inference', 'model', 'tensor', 'gradient', 'backprop', 'optimization',
  'classifier', 'regression', 'supervised', 'unsupervised', 'reinforcement',
  'transformer', 'attention', 'embedding', 'vector', 'bert', 'gpt', 'llama',
  'claude', 'anthropic', 'openai', 'midjourney', 'stable', 'diffusion',

  // Programming Concepts
  'function', 'variable', 'class', 'object', 'method', 'interface', 'type',
  'string', 'array', 'boolean', 'number', 'null', 'undefined', 'async',
  'await', 'promise', 'callback', 'closure', 'scope', 'module', 'import',
  'export', 'default', 'const', 'let', 'var', 'static', 'public', 'private',
  'protected', 'extends', 'implements', 'constructor', 'parameter', 'argument',

  // Web Development
  'react', 'angular', 'vue', 'svelte', 'component', 'props', 'state', 'hook',
  'effect', 'context', 'redux', 'store', 'action', 'reducer', 'dispatch',
  'middleware', 'router', 'route', 'link', 'navigation', 'responsive', 'flex',
  'grid', 'tailwind', 'styled', 'sass', 'webpack', 'babel', 'typescript',
  'javascript', 'html', 'css', 'dom', 'virtual', 'jsx', 'template', 'render',

  // Development Tools
  'git', 'commit', 'branch', 'merge', 'pull', 'push', 'clone', 'fork',
  'repository', 'version', 'control', 'docker', 'container', 'kubernetes',
  'pipeline', 'jenkins', 'travis', 'github', 'gitlab', 'bitbucket', 'azure',
  'aws', 'cloud', 'serverless', 'lambda', 'function', 'api', 'rest', 'graphql',
  'websocket', 'protocol', 'http', 'https', 'ssl', 'ssh', 'ftp', 'sftp',

  // Cyberpunk and Tech
  'cyber', 'hack', 'neural', 'implant', 'augment', 'reality', 'virtual',
  'matrix', 'digital', 'quantum', 'crypto', 'blockchain', 'token', 'smart',
  'contract', 'metaverse', 'avatar', 'hologram', 'bionic', 'synthetic',
  'android', 'cyborg', 'robot', 'drone', 'nanotech', 'biotech', 'interface',
  'terminal', 'console', 'system', 'network', 'firewall', 'encrypt', 'decrypt',

  // Software Architecture
  'microservice', 'monolith', 'architecture', 'pattern', 'design', 'solid',
  'dependency', 'injection', 'inversion', 'control', 'singleton', 'factory',
  'observer', 'strategy', 'composite', 'decorator', 'facade', 'proxy', 'bridge',
  'adapter', 'mediator', 'command', 'iterator', 'visitor', 'state', 'memento',
  'chain', 'responsibility', 'template', 'flyweight', 'prototype', 'builder',

  // Data and Databases
  'database', 'sql', 'nosql', 'mongodb', 'postgres', 'mysql', 'redis', 'cache',
  'index', 'query', 'join', 'aggregate', 'transaction', 'acid', 'schema',
  'model', 'migration', 'seed', 'backup', 'restore', 'shard', 'replica',
  'cluster', 'partition', 'consistency', 'availability', 'tolerance', 'cap',
  'theorem', 'eventual', 'strong', 'weak', 'read', 'write', 'consistency',

  // Game Development
  'engine', 'unity', 'unreal', 'godot', 'sprite', 'texture', 'mesh', 'vertex',
  'shader', 'particle', 'physics', 'collision', 'rigidbody', 'animation',
  'keyframe', 'timeline', 'scene', 'camera', 'light', 'shadow', 'material',
  'render', 'pipeline', 'frame', 'rate', 'buffer', 'input', 'controller',
  'gamepad', 'keyboard', 'mouse', 'touch', 'gesture', 'haptic', 'feedback',

  // Zombie Apocalypse
  'zombie', 'virus', 'infection', 'outbreak', 'survival', 'apocalypse',
  'wasteland', 'scavenge', 'fortify', 'defend', 'barricade', 'weapon',
  'ammunition', 'supplies', 'resource', 'shelter', 'safe', 'zone', 'horde',
  'bite', 'infected', 'cure', 'vaccine', 'immunity', 'quarantine', 'isolation',
  'survivor', 'colony', 'bunker', 'raid', 'scrap', 'salvage', 'repair'
];

interface WordState {
  text: string;
  category: string;
}

interface StreakStats {
  currentStreak: number;
  bestStreak: number;
  wordCount: number;
}

export const TypingGame: React.FC = () => {
  const [currentWords, setCurrentWords] = useState<WordState[]>([]);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [combo, setCombo] = useState(1);
  const [lastDamage, setLastDamage] = useState<{amount: number, isCrit: boolean, count: number} | null>(null);
  const [streak, setStreak] = useState<StreakStats>({
    currentStreak: 0,
    bestStreak: 0,
    wordCount: 1
  });
  
  // Keep track of recently used words to prevent repetition
  const recentWordsRef = useRef<Set<string>>(new Set());
  
  const { 
    updateTypingStats, 
    addExperience, 
    typingDamageMultiplier,
    enemies,
    updateResource,
    damageEnemy,
    activeBuffs
  } = useGameStore();
  const { updateProgress } = useAchievementStore();

  // Reset combo if no input for 2 seconds
  useEffect(() => {
    if (combo > 1) {
      const timer = setTimeout(() => {
        setCombo(1);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [combo, userInput]);

  // Fade out damage numbers
  useEffect(() => {
    if (lastDamage) {
      const timer = setTimeout(() => {
        setLastDamage(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lastDamage]);

  const getRandomWord = useCallback((): WordState => {
    const recentWords = recentWordsRef.current;
    let wordIndex: number;
    let text: string;
    
    // Keep trying until we find a word that hasn't been used recently
    do {
      wordIndex = Math.floor(Math.random() * words.length);
      text = words[wordIndex];
    } while (recentWords.has(text));
    
    // Add the word to recent words and remove oldest if we have too many
    recentWords.add(text);
    if (recentWords.size > 20) { // Keep track of last 20 words
      const firstWord = recentWords.values().next().value;
      recentWords.delete(firstWord);
    }
    
    const categoryEntry = Object.entries(wordCategories).find(([_, [start, end]]) => 
      wordIndex >= start && wordIndex <= end
    );
    const category = categoryEntry ? categoryEntry[0] : 'Unknown';
    
    return { text, category };
  }, []);

  const generateWords = useCallback((count: number) => {
    const newWords: WordState[] = [];
    for (let i = 0; i < count; i++) {
      newWords.push(getRandomWord());
    }
    return newWords;
  }, [getRandomWord]);

  useEffect(() => {
    setCurrentWords(generateWords(streak.wordCount));
  }, [generateWords, streak.wordCount]);

  const calculateCharacterStates = () => {
    const targetText = currentWords.map(w => w.text).join(' ');
    return targetText.split('').map((char, index) => {
      if (index >= userInput.length) return 'pending';
      return userInput[index] === char ? 'correct' : 'incorrect';
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      setBackspaceCount(prev => prev + 1);
      setAccuracy(prev => Math.max(50, prev - 1));
    }
  };

  const updateStreak = (success: boolean, finalAccuracy: number) => {
    setStreak(prevStreak => {
      if (success && finalAccuracy >= 90) {
        const newStreak = prevStreak.currentStreak + 1;
        // Increase word count every 3 successful attempts
        const newWordCount = newStreak % 3 === 0 ? 
          Math.min(prevStreak.wordCount + 1, 10) : 
          prevStreak.wordCount;
        
        return {
          currentStreak: newStreak,
          bestStreak: Math.max(prevStreak.bestStreak, newStreak),
          wordCount: newWordCount
        };
      } else {
        // On failure, keep the same word count but reset streak
        return {
          currentStreak: 0,
          bestStreak: prevStreak.bestStreak,
          wordCount: prevStreak.wordCount
        };
      }
    });
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);

    if (!startTime) {
      setStartTime(Date.now());
    }

    const targetText = currentWords.map(w => w.text).join(' ');
    
    // Check if the entire phrase is completed
    if (value === targetText) {
      const newWordCount = wordCount + currentWords.length;
      setWordCount(newWordCount);
      
      if (startTime) {
        const timeElapsed = (Date.now() - startTime) / 1000 / 60; // Time in minutes
        // Calculate WPM using standard word length (5 characters)
        const charactersTyped = targetText.length;
        const standardWordLength = 5;
        const wpm = Math.min(200, Math.round((charactersTyped / standardWordLength) / timeElapsed)); // Cap at 200 WPM for realism
        
        const finalAccuracy = Math.max(50, accuracy - (backspaceCount * 2));
        updateTypingStats(wpm, finalAccuracy);
        
        // Calculate damage with combo system
        const critMultiplier = Math.random() < (finalAccuracy / 200) ? 2.5 : 1;
        const comboMultiplier = Math.min(5, 1 + (combo * 0.2));
        
        // Calculate base damage with improved scaling
        const baseDamage = wpm * (finalAccuracy / 100);
        const buffMultiplier = typingDamageMultiplier;
        
        // New exponential scaling for higher WPM values
        const wpmScaling = Math.pow(1.1, Math.floor(wpm / 10));
        
        // Calculate final damage with all multipliers
        const totalDamage = Math.floor(
          baseDamage * 
          buffMultiplier * 
          comboMultiplier * 
          wpmScaling * 
          critMultiplier
        );

        // Apply damage to all enemies with improved scaling
        if (enemies.length > 0) {
          // New damage scaling formula:
          // - For 1-3 enemies: 100% damage each
          // - For 4+ enemies: Scale from 100% to 75% based on count
          const enemyCount = enemies.length;
          let damageMultiplier = 1;
          
          if (enemyCount > 3) {
            // Scale from 100% to 75% between 4 and 20 enemies
            damageMultiplier = Math.max(0.75, 1 - ((enemyCount - 3) / 68));
          }
          
          const damagePerEnemy = Math.floor(totalDamage * damageMultiplier);
          
          enemies.forEach(enemy => {
            damageEnemy(enemy.id, damagePerEnemy);
          });

          // Show damage numbers for all enemies
          setLastDamage({
            amount: damagePerEnemy,
            isCrit: critMultiplier > 1,
            count: enemies.length
          });
        }
        
        // Increase combo for successful completion
        setCombo(prev => prev + 1);
        
        // Calculate experience with streak bonus
        const baseExp = targetText.length * 5;
        const speedBonus = Math.floor(wpm / 10);
        const multiWordBonus = currentWords.length * 10;
        const streakBonus = streak.currentStreak * 5;
        const accuracyPenalty = Math.floor((100 - finalAccuracy) / 2);
        const totalExp = baseExp + speedBonus + multiWordBonus + streakBonus - accuracyPenalty;
        
        // Update achievements
        updateProgress('wpm-30', wpm);
        updateProgress('wpm-50', wpm);
        updateProgress('wpm-80', wpm);
        updateProgress('accuracy-95', finalAccuracy);
        updateProgress('streak-5', streak.currentStreak);
        updateProgress('streak-10', streak.currentStreak);
        updateProgress('words-25', newWordCount);
        updateProgress('words-50', newWordCount);
        updateProgress('words-100', newWordCount);
        updateProgress('words-200', newWordCount);
        updateProgress('words-350', newWordCount);
        updateProgress('words-500', newWordCount);
        updateProgress('words-750', newWordCount);
        updateProgress('words-1000', newWordCount);
        
        if (finalAccuracy === 100 && backspaceCount === 0) {
          updateProgress('perfect-run', 1);
        }
        
        if (currentWords.length >= 5 && timeElapsed * 60 < 5) {
          updateProgress('speed-demon', 1);
        }
        
        addExperience(totalExp);
        updateResource('Scrap', Math.floor(totalDamage * 0.1));
        updateResource('Energy', Math.floor(totalDamage * 0.05));

        updateStreak(true, finalAccuracy);
        setCurrentWords(generateWords(streak.wordCount));
      }

      setUserInput('');
      setBackspaceCount(0);
      setAccuracy(100);
      setStartTime(null);
    } else {
      const isCorrectSoFar = value === targetText.substring(0, value.length);
      if (!isCorrectSoFar) {
        setAccuracy(prev => Math.max(50, prev - 1));
        setCombo(1); // Reset combo on mistakes
      }
    }
  };

  const characterStates = calculateCharacterStates();
  const targetText = currentWords.map(w => w.text).join(' ');

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Typing Defense</h2>
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            {currentWords.map((word, idx) => (
              <div key={idx} className="text-sm text-blue-400">{word.category}</div>
            ))}
          </div>
          <div className="text-sm">
            <span className="text-yellow-400">Streak: {streak.currentStreak}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-orange-400">Best: {streak.bestStreak}</span>
            <span className="text-gray-400 mx-2">|</span>
            <span className="text-green-400">Words: {streak.wordCount}</span>
            {combo > 1 && (
              <>
                <span className="text-gray-400 mx-2">|</span>
                <span className="text-purple-400 animate-pulse">
                  Combo: x{combo} ({(Math.min(5, 1 + (combo * 0.2))).toFixed(1)}x DMG)
                </span>
              </>
            )}
          </div>
        </div>

        {/* Active Buffs Display */}
        {activeBuffs.length > 0 && (
          <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
            {activeBuffs.filter(buff => buff.endTime > Date.now()).map(buff => {
              const remainingTime = Math.max(0, Math.floor((buff.endTime - Date.now()) / 1000));
              const minutes = Math.floor(remainingTime / 60);
              const seconds = remainingTime % 60;
              
              let icon = '✨';
              let color = 'text-yellow-400';
              switch (buff.type) {
                case 'damage':
                  icon = '⚔️';
                  color = 'text-red-400';
                  break;
                case 'resource':
                  icon = '📦';
                  color = 'text-blue-400';
                  break;
                case 'experience':
                  icon = '📚';
                  color = 'text-green-400';
                  break;
                case 'money':
                  icon = '💰';
                  color = 'text-yellow-400';
                  break;
              }

              return (
                <div
                  key={buff.id}
                  className="flex items-center bg-gray-700 rounded-lg px-3 py-1 space-x-2 flex-shrink-0"
                >
                  <span className="text-xl">{icon}</span>
                  <div>
                    <div className={`text-sm font-semibold ${color}`}>
                      x{buff.multiplier.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-400">
                      {minutes}:{seconds.toString().padStart(2, '0')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {lastDamage && (
          <div 
            className={`fixed right-8 top-1/2 transform -translate-y-1/2 text-4xl font-bold z-50 ${
              lastDamage.isCrit ? 'text-yellow-400 scale-110' : 'text-red-400'
            } animate-fadeOutUp`}
            style={{
              textShadow: '0 0 10px rgba(0,0,0,0.5)'
            }}
          >
            {lastDamage.isCrit ? 'CRITICAL! ' : ''}
            {lastDamage.amount.toLocaleString()}
            {lastDamage.count > 1 && (
              <span className="text-blue-400"> x{lastDamage.count}</span>
            )}
          </div>
        )}
        <div className="text-2xl font-mono mb-2">
          {targetText.split('').map((char, idx) => (
            <span
              key={idx}
              className={`
                ${characterStates[idx] === 'correct' ? 'text-green-400' : ''}
                ${characterStates[idx] === 'incorrect' ? 'text-red-400' : ''}
                ${characterStates[idx] === 'pending' ? 'text-gray-400' : ''}
              `}
            >
              {char}
            </span>
          ))}
        </div>
        <div className="text-xs text-gray-400 mb-2">
          Base Experience: {targetText.length * 5}
          <br />
          Multi-word Bonus: +{currentWords.length * 10}
          <br />
          Speed Bonus: +1 per 10 WPM
          <br />
          Streak Bonus: +{streak.currentStreak * 5}
          <br />
          Accuracy Penalty: -{Math.floor((100 - accuracy) / 2)}
          <br />
          Combo Multiplier: x{(Math.min(5, 1 + (combo * 0.2))).toFixed(1)}
          <br />
          Critical Hit Chance: {Math.floor(accuracy / 2)}%
        </div>
        <input
          type="text"
          value={userInput}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-green-500"
          placeholder={`Type ${currentWords.length} word${currentWords.length > 1 ? 's' : ''}...`}
          autoFocus
        />
      </div>
      <div className="text-gray-300">
        <div>Words completed: {wordCount}</div>
        <div>Current accuracy: {accuracy}%</div>
        <div>Backspace count: {backspaceCount}</div>
        <div>Damage multiplier: x{typingDamageMultiplier.toFixed(2)}</div>
      </div>
    </div>
  );
}; 