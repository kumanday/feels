// tests/test_error_handling.js

import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AudioCapture from '../src/components/AudioCapture'; // Adjust path as needed
import { useAudioContext } from '../src/audio/AudioContextProvider'; // Mocked

// Mock the AudioContext and navigator.mediaDevices
global.AudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamSource: jest.fn(),
  createAnalyser: jest.fn(() => ({
    getFloatTimeDomainData: jest.fn(),
    getFloatFrequencyData: jest.fn(),
  })),
  resume: jest.fn(),
  suspend: jest.fn(),
}));

// Existing mocks and tests (assuming these are already present, we're updating by adding more)
jest.mock('../src/audio/AudioContextProvider', () => ({
  useAudioContext: () => ({
    startCapture: jest.fn(),
    stopCapture: jest.fn(),
    status: 'stopped',
    error: null,
  }),
}));

describe('Error Handling in AudioCapture Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Existing tests (placeholder for what might already be there)
  it('displays error message when microphone permission is denied', async () => {
    const mockGetUserMedia = jest.fn().mockRejectedValue(new Error('Permission denied'));
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };

    const { getByText, findByText } = render(<AudioCapture />);
    fireEvent.click(getByText('Start'));

    const errorMessage = await findByText('Microphone access denied. Please grant permission to use the app.');
    expect(errorMessage).toBeInTheDocument();
  });

  it('handles browser incompatibility gracefully', () => {
    delete global.navigator.mediaDevices; // Simulate unsupported browser

    const { getByText } = render(<AudioCapture />);
    fireEvent.click(getByText('Start'));

    expect(getByText('Your browser does not support microphone access. Please use a modern browser.')).toBeInTheDocument();
  });

  // New tests added as per PRD
  it('handles audio context suspension and resumes', async () => {
    const mockAudioContext = {
      state: 'suspended',
      resume: jest.fn().mockResolvedValue(undefined),
      createMediaStreamSource: jest.fn(),
      createAnalyser: jest.fn(),
    };
    global.AudioContext = jest.fn().mockReturnValue(mockAudioContext);

    const mockGetUserMedia = jest.fn().mockResolvedValue({}); // Mock stream
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };

    const { getByText } = render(<AudioCapture />);
    fireEvent.click(getByText('Start'));

    await waitFor(() => expect(mockAudioContext.resume).toHaveBeenCalled());
    expect(getByText('Listening')).toBeInTheDocument(); // Assuming it resumes successfully
  });

  it('displays fallback UI when audio context cannot be created', () => {
    global.AudioContext = jest.fn().mockImplementation(() => {
      throw new Error('AudioContext not supported');
    });

    const { getByText } = render(<AudioCapture />);
    fireEvent.click(getByText('Start'));

    expect(getByText('Audio processing is not supported in this browser. Please try another.')).toBeInTheDocument();
  });

  it('shows user-friendly message for generic errors', async () => {
    const mockGetUserMedia = jest.fn().mockRejectedValue(new Error('Unknown error'));
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };

    const { getByText, findByText } = render(<AudioCapture />);
    fireEvent.click(getByText('Start'));

    const errorMessage = await findByText('An unexpected error occurred. Please try again.');
    expect(errorMessage).toBeInTheDocument();
  });

  it('ensures keyboard accessibility for error dialogs', () => {
    const mockGetUserMedia = jest.fn().mockRejectedValue(new Error('Permission denied'));
    navigator.mediaDevices = { getUserMedia: mockGetUserMedia };

    const { getByText, getByRole } = render(<AudioCapture />);
    fireEvent.click(getByText('Start'));

    const errorDialog = getByRole('alert');
    expect(errorDialog).toBeInTheDocument();
    expect(errorDialog).toHaveAttribute('tabindex', '0'); // Ensure focusable
  });
});