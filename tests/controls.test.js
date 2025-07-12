// tests/controls.test.js

import { render, fireEvent } from '@testing-library/react';
import Controls from '../src/components/Controls'; // Adjust path as needed

describe('Controls Component', () => {
  test('renders start/stop button and status', () => {
    const handleStart = jest.fn();
    const handleStop = jest.fn();
    const { getByText } = render(<Controls isListening={false} status="Stopped" onStart={handleStart} onStop={handleStop} />);

    expect(getByText('Start')).toBeInTheDocument();
    expect(getByText('Status: Stopped')).toBeInTheDocument();
  });

  test('calls onStart when start button is clicked', () => {
    const handleStart = jest.fn();
    const handleStop = jest.fn();
    const { getByText } = render(<Controls isListening={false} status="Stopped" onStart={handleStart} onStop={handleStop} />);

    fireEvent.click(getByText('Start'));
    expect(handleStart).toHaveBeenCalled();
  });

  test('calls onStop when stop button is clicked', () => {
    const handleStart = jest.fn();
    const handleStop = jest.fn();
    const { getByText } = render(<Controls isListening={true} status="Listening" onStart={handleStart} onStop={handleStop} />);

    fireEvent.click(getByText('Stop'));
    expect(handleStop).toHaveBeenCalled();
  });

  test('displays correct status', () => {
    const { getByText, rerender } = render(<Controls isListening={false} status="Stopped" onStart={() => {}} onStop={() => {}} />);

    expect(getByText('Status: Stopped')).toBeInTheDocument();

    rerender(<Controls isListening={true} status="Listening" onStart={() => {}} onStop={() => {}} />);
    expect(getByText('Status: Listening')).toBeInTheDocument();
  });
});