import { render, act, waitFor } from '@testing-library/react';
import AudioCapture, { AudioCtx } from '../src/components/AudioCapture'; // Adjust path as needed

// Mock browser APIs
jest.spyOn(navigator.mediaDevices, 'getUserMedia').mockImplementation(() => Promise.resolve({}));
global.AudioContext = jest.fn().mockImplementation(() => ({
  createMediaStreamSource: jest.fn(() => ({})),
  createAnalyser: jest.fn(() => ({
    fftSize: 2048,
    getFloatTimeDomainData: jest.fn(),
    getFloatFrequencyData: jest.fn(),
  })),
  createGain: jest.fn(() => ({
    gain: { value: 1.0 },
  })),
  resume: jest.fn(),
}));

describe('AudioCapture Component', () => {
  it('renders without crashing', () => {
    render(
      <AudioCapture>
        <div>Test Child</div>
      </AudioCapture>
    );
  });

  it('requests microphone access on start', async () => {
    let startFunc;
    render(
      <AudioCapture>
        <AudioCtx.Consumer>
          {({ start }) => {
            startFunc = start;
            return <div />;
          }}
        </AudioCtx.Consumer>
      </AudioCapture>
    );

    await act(async () => {
      await startFunc();
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it('handles permission denial gracefully', async () => {
    jest.spyOn(navigator.mediaDevices, 'getUserMedia').mockRejectedValueOnce(new Error('Permission denied'));

    let startFunc, errorValue;
    render(
      <AudioCapture>
        <AudioCtx.Consumer>
          {({ start, error }) => {
            startFunc = start;
            errorValue = error;
            return <div />;
          }}
        </AudioCtx.Consumer>
      </AudioCapture>
    );

    await act(async () => {
      try {
        await startFunc();
      } catch (err) {
        // Expected error
      }
    });

    await waitFor(() => expect(errorValue).not.toBeNull());
  });

  it('stops audio capture', async () => {
    let startFunc, stopFunc;
    render(
      <AudioCapture>
        <AudioCtx.Consumer>
          {({ start, stop }) => {
            startFunc = start;
            stopFunc = stop;
            return <div />;
          }}
        </AudioCtx.Consumer>
      </AudioCapture>
    );

    await act(async () => {
      await startFunc();
      stopFunc();
    });

    // Add assertions for stopped state if needed
  });

  it('adjusts gain correctly', async () => {
    let startFunc, setGainFunc;
    render(
      <AudioCapture>
        <AudioCtx.Consumer>
          {({ start, setGain }) => {
            startFunc = start;
            setGainFunc = setGain;
            return <div />;
          }}
        </AudioCtx.Consumer>
      </AudioCapture>
    );

    await act(async () => {
      await startFunc();
      setGainFunc(0.5);
    });

    // Assuming gainNode is accessible or mocked to check value
    expect(global.AudioContext.mock.results[0].value.createGain().gain.value).toBe(0.5);
  });

  it('changes FFT size', async () => {
    let startFunc, setFftSizeFunc;
    render(
      <AudioCapture>
        <AudioCtx.Consumer>
          {({ start, setFftSize }) => {
            startFunc = start;
            setFftSizeFunc = setFftSize;
            return <div />;
          }}
        </AudioCtx.Consumer>
      </AudioCapture>
    );

    await act(async () => {
      await startFunc();
      setFftSizeFunc(1024);
    });

    // Assuming analyser is mocked to check fftSize
    expect(global.AudioContext.mock.results[0].value.createAnalyser().fftSize).toBe(1024);
  });

  // Additional test for gainNode creation
  it('creates gainNode on start', async () => {
    let startFunc;
    render(
      <AudioCapture>
        <AudioCtx.Consumer>
          {({ start }) => {
            startFunc = start;
            return <div />;
          }}
        </AudioCtx.Consumer>
      </AudioCapture>
    );

    await act(async () => {
      await startFunc();
    });

    expect(global.AudioContext.mock.results[0].value.createGain).toHaveBeenCalled();
  });

  // Additional test for setGain functionality
  it('sets gain value correctly on gainNode', async () => {
    let startFunc, setGainFunc;
    const mockGainNode = { gain: { value: 1.0 } };
    global.AudioContext.mockImplementation(() => ({
      createGain: jest.fn(() => mockGainNode),
      // ... other mocks
    }));

    render(
      <AudioCapture>
        <AudioCtx.Consumer>
          {({ start, setGain }) => {
            startFunc = start;
            setGainFunc = setGain;
            return <div />;
          }}
        </AudioCtx.Consumer>
      </AudioCapture>
    );

    await act(async () => {
      await startFunc();
      setGainFunc(1.5);
    });

    expect(mockGainNode.gain.value).toBe(1.5);
  });
});