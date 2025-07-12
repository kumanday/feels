import { useState } from 'react';
import UserControls from '../components/UserControls';
import Oscilloscope from '../components/Oscilloscope';
import Spectrogram from '../components/Spectrogram';
import AudioCapture from '../components/AudioCapture';

export default function Home() {
  const [isListening, setIsListening] = useState(false);

  return (
    <AudioCapture>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 text-white overflow-hidden">
        {/* Cyberpunk grid background */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0 bg-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grid' width='60' height='60' patternUnits='userSpaceOnUse'%3e%3cpath d='m 60 0 l 0 60 m -60 0 l 60 0' fill='none' stroke='%2300ffff' stroke-width='1' opacity='0.3'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)' /%3e%3c/svg%3e")`
            }}
          ></div>
        </div>
        
        {/* Glowing orbs */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-cyan-500 rounded-full blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-purple-500 rounded-full blur-3xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-pink-500 rounded-full blur-3xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
        
        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              FEELS
            </h1>
            <p className="text-gray-400 text-lg font-mono tracking-wider">REAL-TIME AUDIO VISUALIZATION</p>
            <div className="w-32 h-0.5 bg-gradient-to-r from-cyan-500 to-purple-500 mx-auto mt-4"></div>
          </div>
          
          {/* Controls */}
          <div className="mb-8">
            <UserControls />
          </div>
          
          {/* Visualizations */}
          <div className="w-full max-w-6xl space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
                  <h3 className="text-cyan-400 font-mono text-sm mb-2 uppercase tracking-wider">Oscilloscope</h3>
                  <div className="bg-black rounded-lg overflow-hidden border border-gray-700">
                    <Oscilloscope />
                  </div>
                </div>
              </div>
              
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative bg-black/80 backdrop-blur-sm border border-gray-800 rounded-xl p-4">
                  <h3 className="text-purple-400 font-mono text-sm mb-2 uppercase tracking-wider">Spectrogram</h3>
                  <div className="bg-black rounded-lg overflow-hidden border border-gray-700">
                    <Spectrogram />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="flex items-center justify-center space-x-4 text-gray-500 text-sm font-mono">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>SYSTEM ONLINE</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </AudioCapture>
  );
}