import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react';
import App from '../src/app/page'; // Assuming App Router structure
import { AudioCaptureProvider } from '../src/components/AudioCapture';

// Mock browser APIs
global.navigator.mediaDevices = {
  getUserMedia: jest.fn().mockResolvedValue({}),
};

global.AudioContext = jest.fn(() => ({
  createMediaStreamSource: jest.fn(() => ({})),
  createAnalyser: jest.fn(() => ({
    getFloatTimeDomainData: jest.fn((array) => array.fill(0)),
    getFloatFrequencyData: jest.fn((array) => array.fill(-100)),
    fftSize: 2048,
  })),
  resume: jest.fn(),
  suspend: jest.fn(),
}));

global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

describe('Main Feels App', () => {
  it('renders the app with initial stopped state', () => {
    const { getByText } = render(
      <AudioCaptureProvider>
        <App />
      </AudioCaptureProvider>
    );
    expect(getByText(/Stopped/i)).toBeInTheDocument();
    expect(getByText(/Start/i)).toBeInTheDocument();
  });

  it('starts audio capture and visualizes data', async () => {
    const { getByText, getByTestId } = render(
      <AudioCaptureProvider>
        <App />
      </AudioCaptureProvider>
    );
    fireEvent.click(getByText(/Start/i));
    await waitFor(() => expect(getByText(/Listening/i)).toBeInTheDocument());

    // Simulate animation frame
    act(() => {
      global.requestAnimationFrame.mock.calls[0][0]();
    });

    // Assume canvases are updated (mock drawing checks if needed)
    expect(getByTestId('oscilloscope-canvas')).toBeInTheDocument();
    expect(getByTestId('spectrogram-canvas')).toBeInTheDocument();
  });

  it('stops audio capture', async () => {
    const { getByText } = render(
      <AudioCaptureProvider>
        <App />
      </AudioCaptureProvider>
    );
    fireEvent.click(getByText(/Start/i));
    await waitFor(() => expect(getByText(/Listening/i)).toBeInTheDocument());

    fireEvent.click(getByText(/Stop/i));
    await waitFor(() => expect(getByText(/Stopped/i)).toBeInTheDocument());
  });

  it('handles permission denial', async () => {
    global.navigator.mediaDevices.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
    const { getByText } = render(
      <AudioCaptureProvider>
        <App />
      </AudioCaptureProvider>
    );
    fireEvent.click(getByText(/Start/i));
    await waitFor(() => expect(getByText(/Microphone access denied/i)).toBeInTheDocument());
  });
});