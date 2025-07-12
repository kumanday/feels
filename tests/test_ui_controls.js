import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import UserControls from '../src/components/UserControls';
import { useContext } from 'react';

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useContext: jest.fn(),
}));

describe('UserControls Component UI', () => {
  beforeEach(() => {
    useContext.mockReturnValue({
      start: jest.fn(),
      stop: jest.fn(),
      isListening: false,
      error: null,
      gainNode: { gain: { value: 1.0 } },
      analyser: { fftSize: 2048 },
      setGain: jest.fn(),
      setFftSize: jest.fn(),
    });
  });

  test('renders start and stop buttons', () => {
    const { getByText } = render(<UserControls />);
    expect(getByText(/start/i)).toBeInTheDocument();
    expect(getByText(/stop/i)).toBeInTheDocument();
  });

  test('displays current status', () => {
    const { getByText } = render(<UserControls />);
    expect(getByText(/stopped/i)).toBeInTheDocument();
  });

  test('renders sliders for gain and FFT size', () => {
    const { getByLabelText } = render(<UserControls />);
    expect(getByLabelText(/gain/i)).toBeInTheDocument();
    expect(getByLabelText(/fft size/i)).toBeInTheDocument();
  });

  test('applies dark mode styling', () => {
    const { container } = render(<UserControls />);
    expect(container.firstChild).toHaveClass('bg-gray-800 text-white');
  });

  test('adapts responsive layout', () => {
    const { container } = render(<UserControls />);
    expect(container.firstChild).toHaveClass('flex flex-col md:flex-row');
  });

  test('shows tooltip on hover for start button', () => {
    const { getByText } = render(<UserControls />);
    const startButton = getByText(/start/i);
    fireEvent.mouseOver(startButton);
    expect(startButton).toHaveAttribute('title', 'Start listening to audio');
  });

  test('disables stop button when not listening', () => {
    const { getByText } = render(<UserControls />);
    const stopButton = getByText(/stop/i);
    expect(stopButton).toBeDisabled();
  });
});