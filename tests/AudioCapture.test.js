// tests/AudioCapture.test.js

import { render, act } from '@testing-library/react';
import AudioCapture, { AudioCtx } from '../src/components/AudioCapture'; // Adjust path as needed
import React, { useContext } from 'react';

// Mock browser APIs
const mockStream = {
  getTracks: jest.fn(() => [{
    stop: jest.fn()
  }])
};

global.navigator.mediaDevices = {
  getUserMedia: jest.fn(() => Promise.resolve(mockStream)),
};

const mockAnalyser = {
  fftSize: 2048,
  connect: jest.fn(),
  getFloatTimeDomainData: jest.fn(),
  getFloatFrequencyData: jest.fn(),
};

const mockGainNode = {
  connect: jest.fn(),
  gain: { value: 1.0 }
};

const mockAudioContext = {
  resume: jest.fn(() => Promise.resolve()),
  close: jest.fn(),
  createMediaStreamSource: jest.fn(() => ({
    connect: jest.fn()
  })),
  createAnalyser: jest.fn(() => mockAnalyser),
  createGain: jest.fn(() => mockGainNode),
};

global.AudioContext = jest.fn(() => mockAudioContext);

const TestComponent = () => {
  const { start, stop, analyser, error, isListening } = useContext(AudioCtx);
  return (
    <div>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
      <div data-testid="status">{isListening ? 'Active' : 'Inactive'}</div>
      <div data-testid="error">{error}</div>
      {analyser && <div data-testid="analyser">Analyser Present</div>}
    </div>
  );
};

describe('AudioCapture Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with inactive state and no error', () => {
    const { getByTestId } = render(
      <AudioCapture>
        <TestComponent />
      </AudioCapture>
    );
    expect(getByTestId('status').textContent).toBe('Inactive');
    expect(getByTestId('error').textContent).toBe('');
  });

  it('starts audio capture on start call', async () => {
    const { getByText, getByTestId } = render(
      <AudioCapture>
        <TestComponent />
      </AudioCapture>
    );

    await act(async () => {
      getByText('Start').click();
      await Promise.resolve(); // Wait for async operations
    });

    expect(global.navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(global.AudioContext).toHaveBeenCalled();
    expect(getByTestId('status').textContent).toBe('Active');
    expect(getByTestId('analyser')).toBeInTheDocument();
  });

  it('stops audio capture on stop call', async () => {
    const { getByText, getByTestId } = render(
      <AudioCapture>
        <TestComponent />
      </AudioCapture>
    );

    await act(async () => {
      getByText('Start').click();
      await Promise.resolve();
    });

    await act(async () => {
      getByText('Stop').click();
      await Promise.resolve();
    });

    expect(getByTestId('status').textContent).toBe('Inactive');
  });

  it('handles permission denied error', async () => {
    global.navigator.mediaDevices.getUserMedia = jest.fn(() => Promise.reject(new Error('Permission denied')));

    const { getByText, getByTestId } = render(
      <AudioCapture>
        <TestComponent />
      </AudioCapture>
    );

    await act(async () => {
      getByText('Start').click();
      await Promise.resolve();
    });

    expect(getByTestId('error').textContent).toContain('Permission denied');
    expect(getByTestId('status').textContent).toBe('Inactive');
  });
});