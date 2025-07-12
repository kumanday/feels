// src/components/Controls.js
import React from 'react';

const Controls = ({ isListening, status, onStart, onStop }) => {
  return (
    <div className="controls-container">
      <button 
        onClick={isListening ? onStop : onStart}
        className={`control-button ${isListening ? 'stop' : 'start'}`}
      >
        {isListening ? 'Stop' : 'Start'}
      </button>
      <div className="status-display">
        Status: {status}
      </div>
    </div>
  );
};

export default Controls;
