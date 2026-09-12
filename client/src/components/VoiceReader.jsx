import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function VoiceReader({ text, label = 'Listen', className = '' }) {
  const { language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
    }
  }, []);

  const handleToggleSpeak = (e) => {
    e.stopPropagation();
    if (!supported || !text) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending speech

    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Map language code
    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'mr') {
      utterance.lang = 'mr-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.92; // Slightly slower for clear rural comprehension
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!supported) return null;

  const buttonText = isSpeaking
    ? (language === 'hi' ? 'रोकें' : language === 'mr' ? 'थांबवा' : 'Stop')
    : (language === 'hi' ? 'सुनें' : language === 'mr' ? 'ऐका' : label);

  return (
    <button
      type="button"
      onClick={handleToggleSpeak}
      className={`voice-reader-btn ${isSpeaking ? 'speaking' : ''} ${className}`}
      title="Audio voice readout for accessibility"
      aria-label="Text to speech audio readout"
    >
      {isSpeaking ? (
        <>
          <VolumeX size={16} className="voice-icon pulse-anim" />
          <span>{buttonText}</span>
        </>
      ) : (
        <>
          <Volume2 size={16} className="voice-icon" />
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}
