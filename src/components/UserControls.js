import React, { useContext, useState } from 'react';
import { AudioCtx } from './AudioCapture'; // Assuming AudioCapture is in the same directory or adjust path

const UserControls = () => {
  const { start, stop, isListening, error, gainNode, setGain, setFftSize } = useContext(AudioCtx);
  const [localGain, setLocalGain] = useState(1.0); // Default gain
  const [localFftSize, setLocalFftSize] = useState(2048); // Default FFT size

  const handleStartStop = () => {
    if (isListening) {
      stop();
    } else {
      start();
    }
  };

  const handleGainChange = (e) => {
    const newGain = parseFloat(e.target.value);
    setLocalGain(newGain);
    setGain(newGain); // Use setGain from context instead of direct gainNode.gain.value
  };

  const handleFftSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setLocalFftSize(newSize);
    setFftSize(newSize); // Assuming setFftSize is provided in context
  };

  return (
    <div className="bg-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-white font-mono">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Start/Stop Button */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-lg blur opacity-40 group-hover:opacity-60 transition duration-500"></div>
          <button
            onClick={handleStartStop}
            className={`relative px-8 py-3 rounded-lg font-bold uppercase tracking-wider transition duration-300 ${
              isListening 
                ? 'bg-red-900 hover:bg-red-800 text-red-200' 
                : 'bg-green-900 hover:bg-green-800 text-green-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full animate-pulse ${
                isListening ? 'bg-red-400' : 'bg-green-400'
              }`}></div>
              {isListening ? 'STOP' : 'START'}
            </div>
          </button>
        </div>
        
        {/* Status */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-400">STATUS:</span>
          <span className={`font-bold uppercase ${
            isListening ? 'text-green-400' : 'text-gray-500'
          }`}>
            {isListening ? 'ACTIVE' : 'STANDBY'}
          </span>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-700 rounded px-3 py-1">
            ⚠ {error}
          </div>
        )}
      </div>
      
      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Gain Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="gain-slider" className="text-cyan-400 text-sm uppercase tracking-wider">
              Gain
            </label>
            <span className="text-white bg-gray-800 px-2 py-1 rounded text-sm font-mono">
              {localGain.toFixed(1)}
            </span>
          </div>
          <div className="relative">
            <input
              id="gain-slider"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={localGain}
              onChange={handleGainChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-cyan"
            />
          </div>
        </div>
        
        {/* FFT Size Control */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label htmlFor="fft-slider" className="text-purple-400 text-sm uppercase tracking-wider">
              FFT Size
            </label>
            <span className="text-white bg-gray-800 px-2 py-1 rounded text-sm font-mono">
              {localFftSize}
            </span>
          </div>
          <div className="relative">
            <input
              id="fft-slider"
              type="range"
              min="32"
              max="32768"
              step="32"
              value={localFftSize}
              onChange={handleFftSizeChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-purple"
            />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .slider-cyan::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #00ffff, #0080ff);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .slider-purple::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
        
        .slider-cyan::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #00ffff, #0080ff);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
        }
        
        .slider-purple::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default UserControls;