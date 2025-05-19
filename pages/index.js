import { useState } from 'react';

export default function VoiceListingApp() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [listing, setListing] = useState('');

  let recognition;
  if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
  }

  const startListening = () => {
    if (!recognition) return;
    setTranscript('');
    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      processVoiceInput(result);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  const processVoiceInput = (input) => {
    const lower = input.toLowerCase();
    const isWomen = lower.includes("women") || lower.includes("female");
    const chest = lower.match(/chest (\d{1,2}(\.\d+)?)/);
    const length = lower.match(/length (\d{1,2}(\.\d+)?)/);
    const sleeve = lower.match(/sleeve (\d{1,2}(\.\d+)?)/);

    const title = lower.split(" ").slice(0, 5).join(" ") + " listing";

    const listingText = `
${title}

Tagged size [M] (${isWomen ? 'Womens' : 'Mens'})
Measurements taken flat in inches:
Chest: ${chest ? chest[1] : '[CHEST]'}
Length: ${length ? length[1] : '[LENGTH]'}
Sleeve: ${sleeve ? sleeve[1] : '[SLEEVE]'}

AS ALWAYS: Check all photos and read the description fully. Message me with questions. All sales final.`;

    setListing(listingText);
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Voice-Based Listing Generator</h1>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={startListening}
        disabled={listening}
      >
        {listening ? 'Listening...' : 'Start Dictation'}
      </button>
      <p className="mt-4 text-sm text-gray-700">Transcript: {transcript}</p>
      <div className="mt-6 bg-gray-100 p-4 rounded whitespace-pre-wrap">
        {listing || '[Listing will appear here]'}
      </div>
    </div>
  );
}
