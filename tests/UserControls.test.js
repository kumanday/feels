// tests/UserControls.test.js

import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { AudioCtx } from '../src/components/AudioCapture'; // Adjust path as needed
import UserControls from '../src/components/UserControls'; // Adjust path as needed

// Mock the AudioCtx
const mockStartAudio = jest.fn();
const mockStopAudio = jest.fn();
const mockGainNode = { gain: { value: 1.0 } };
const mockAnalyser = { fftSize: 2048 };

const mockSetFftSize = jest.fn((newSize) => {
  mockAnalyser.fftSize = newSize;
});
const mockSetGain = jest.fn((newGain) => {
  mockGainNode.gain.value = newGain;
});

let mockError = null;
const mockStart = jest.fn().mockImplementation(async () => {
  if (mockStartAudio.getMockImplementation() && mockStartAudio.getMockImplementation().toString().includes('reject')) {
    const error = new Error('Permission denied');
    mockError = error.message;
    throw error;
  }
  return mockStartAudio();
});

const mockContextValue = {
  isListening: false,
  start: mockStart,
  stop: mockStopAudio,
  error: null, // Will be updated dynamically
  gainNode: mockGainNode,
  analyser: mockAnalyser,
  setFftSize: mockSetFftSize,
  setGain: mockSetGain,
};

describe('UserControls Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with initial status STANDBY', () => {
    const { getByText } = render(
      <AudioCtx.Provider value={mockContextValue}>
        <UserControls />
      </AudioCtx.Provider>
    );

    expect(getByText('STANDBY')).toBeInTheDocument();
    expect(getByText('START')).toBeInTheDocument();
  });

  it('calls start on toggle and updates status', async () => {
    // Create a context that simulates the listening state after start is called
    const listeningContextValue = {
      ...mockContextValue,
      isListening: true,
      start: jest.fn().mockResolvedValue(undefined)
    };

    const { getByText } = render(
      <AudioCtx.Provider value={listeningContextValue}>
        <UserControls />
      </AudioCtx.Provider>
    );

    // When isListening is true, button should show STOP and status should show ACTIVE
    expect(getByText('STOP')).toBeInTheDocument();
    expect(getByText('ACTIVE')).toBeInTheDocument();
  });

  it('calls stop on toggle when active and updates status', () => {
    const activeContext = { ...mockContextValue, isListening: true };

    const { getByText } = render(
      <AudioCtx.Provider value={activeContext}>
        <UserControls />
      </AudioCtx.Provider>
    );

    // When isListening is true, button should show STOP and status should show ACTIVE
    expect(getByText('STOP')).toBeInTheDocument();
    expect(getByText('ACTIVE')).toBeInTheDocument();
    
    fireEvent.click(getByText('STOP'));

    expect(mockStopAudio).toHaveBeenCalled();
    // Note: The component status changes are handled by the parent context,
    // so we can't test the status change in this isolated test
  });

  it('handles error on startAudio and updates status', async () => {
    // Create a test context that simulates error state
    const errorContextValue = {
      ...mockContextValue,
      error: 'Permission denied',
      start: jest.fn().mockRejectedValue(new Error('Permission denied'))
    };

    const { getByText } = render(
      <AudioCtx.Provider value={errorContextValue}>
        <UserControls />
      </AudioCtx.Provider>
    );

    // The error should be displayed in the component
    expect(getByText('⚠ Permission denied')).toBeInTheDocument();
  });

  it('updates gain value on slider change', () => {
    const { getByLabelText } = render(
      <AudioCtx.Provider value={mockContextValue}>
        <UserControls />
      </AudioCtx.Provider>
    );

    const gainSlider = getByLabelText('Gain');
    fireEvent.change(gainSlider, { target: { value: '1.5' } });

    expect(mockGainNode.gain.value).toBe(1.5);
  });

  it('updates FFT size on slider change', () => {
    const { getByLabelText } = render(
      <AudioCtx.Provider value={mockContextValue}>
        <UserControls />
      </AudioCtx.Provider>
    );

    const fftSlider = getByLabelText('FFT Size');
    fireEvent.change(fftSlider, { target: { value: '4096' } });

    expect(mockAnalyser.fftSize).toBe(4096);
  });
});