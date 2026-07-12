/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { playSound } from '../utils/audio.js';

interface SoundToggleProps {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}

export const SoundToggle: React.FC<SoundToggleProps> = ({ isMuted, setIsMuted }) => {
  return (
    <button
      onClick={() => {
        setIsMuted(!isMuted);
        if (isMuted) {
          playSound('success', false);
        }
      }}
      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-all text-[#FFCC00] cursor-pointer"
      title={isMuted ? 'Unmute' : 'Mute'}
    >
      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
};
