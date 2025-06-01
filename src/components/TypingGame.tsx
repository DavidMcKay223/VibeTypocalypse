import React, { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';

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

export const TypingGame: React.FC = () => {
  const [currentWord, setCurrentWord] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const { 
    updateTypingStats, 
    addExperience, 
    typingDamageMultiplier,
    enemies,
    updateResource
  } = useGameStore();

  const getRandomWord = useCallback(() => {
    const wordIndex = Math.floor(Math.random() * words.length);
    const word = words[wordIndex];
    
    // Find the category for this word
    const category = Object.entries(wordCategories).find(([_, [start, end]]) => 
      wordIndex >= start && wordIndex <= end
    )?.[0] || 'Unknown';
    
    setCurrentCategory(category);
    return word;
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
        
        // Calculate and deal damage
        const baseDamage = wpm * (accuracy / 100);
        const totalDamage = baseDamage * typingDamageMultiplier;
        
        // Calculate experience based on word length and typing speed
        const baseExp = currentWord.length * 5; // 5 exp per character
        const speedBonus = Math.floor(wpm / 10); // Bonus exp for every 10 WPM
        const totalExp = baseExp + speedBonus;
        
        // Add experience and resources
        addExperience(totalExp);
        updateResource('Scrap', Math.floor(totalDamage * 0.1));
        updateResource('Energy', Math.floor(totalDamage * 0.05));
      }

      setUserInput('');
      setCurrentWord(getRandomWord());
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Typing Defense</h2>
      <div className="mb-4">
        <div className="text-sm text-blue-400 mb-1">{currentCategory}</div>
        <div className="text-2xl font-mono text-green-400 mb-2">
          {currentWord}
        </div>
        <div className="text-xs text-gray-400 mb-2">
          Experience: {currentWord.length * 5}+ (Speed bonus: +1 per 10 WPM)
        </div>
        <input
          type="text"
          value={userInput}
          onChange={handleInput}
          className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-green-500"
          placeholder="Type the word..."
          autoFocus
        />
      </div>
      <div className="text-gray-300">
        <div>Words completed: {wordCount}</div>
        <div>Damage multiplier: x{typingDamageMultiplier.toFixed(2)}</div>
      </div>
    </div>
  );
}; 