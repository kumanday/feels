import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import UserControls from '../src/components/UserControls';
import { AudioCtx } from '../src/components/AudioCapture'; // Assuming path

// Mock useContext
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockSetGain = jest.fn();
const mockSetFftSize = jest.fn();

const mockContextValue = {
  start: mockStart,
  stop: mockStop,
  isListening: false,
  error: null,
  gainNode: { gain: { value: 1.0 } },
  analyser: { fftSize: 2048 },
  setGain: mockSetGain,
  setFftSize: mockSetFftSize,
};

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: () => mockContextValue,
}));

describe('UserControls Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders with stopped status', () => {
    const { getByText } = render(<UserControls />);
    expect(getByText(/stopped/i)).toBeInTheDocument();
  });

  test('toggles listening state on button click', async () => {
    const { getByText, rerender } = render(<UserControls />);

    fireEvent.click(getByText(/start/i));
    expect(mockStart).toHaveBeenCalled();

    // Simulate context update
    mockContextValue.isListening = true;
    rerender(<UserControls />);

    fireEvent.click(getByText(/stop/i));
    expect(mockStop).toHaveBeenCalled();
  });

  test('updates gain on slider change', () => {
    const { getByLabelText } = render(<UserControls />);
    const gainSlider = getByLabelText(/gain/i);
    fireEvent.change(gainSlider, { target: { value: '1.5' } });
    expect(mockSetGain).toHaveBeenCalledWith(1.5);
  });

  test('updates FFT size on slider change', () => {
    const { getByLabelText } = render(<UserControls />);
    const fftSlider = getByLabelText(/fft size/i);
    fireEvent.change(fftSlider, { target: { value: '4096' } });
    expect(mockSetFftSize).toHaveBeenCalledWith(4096);
  });

  test('displays error status', () => {
    mockContextValue.error = 'Microphone access denied';
    const { getByText } = render(<UserControls />);
    expect(getByText(/microphone access denied/i)).toBeInTheDocument();
  });

  // Added unit tests
  test('adjusts zoom level', () => {
    const mockSetZoom = jest.fn();
    mockContextValue.setZoom = mockSetZoom;
    const { getByLabelText } = render(<UserControls />);
    fireEvent.change(getByLabelText(/zoom/i), { target: { value: '2' } });
    expect(mockSetZoom).toHaveBeenCalledWith(2);
  });

  test('includes ARIA labels for accessibility', () => {
    const { getByLabelText } = render(<UserControls />);
    expect(getByLabelText(/start listening/i)).toBeInTheDocument();
    expect(getByLabelText(/stop listening/i)).toBeInTheDocument();
  });

  test('updates status in real-time', async () => {
    const { findByText, rerender } = render(<UserControls />);
    mockContextValue.isListening = true;
    rerender(<UserControls />);
    expect(await findByText(/listening/i)).toBeInTheDocument();
  });
});