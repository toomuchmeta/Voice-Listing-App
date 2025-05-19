import { useState } from 'react';

export default function VoiceListingApp() {
  const [template, setTemplate] = useState('');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [listing, setListing] = useState('');
  const [formData, setFormData] = useState({});
  const [archive, setArchive] = useState([]);
  const [showArchive, setShowArchive] = useState(false);

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
    const bust = lower.match(/bust (\d{1,2}(\.\d+)?)/);
    const length = lower.match(/length (\d{1,2}(\.\d+)?)/);
    const sleeve = lower.match(/sleeve (\d{1,2}(\.\d+)?)/);
    const shoulder = lower.match(/shoulder (\d{1,2}(\.\d+)?)/);

    const sleeveless = /(tank top|tube top|vest|sleeveless|camisole|halter|muscle tee)/.test(lower);
    const measurementLabel = isWomen ? 'Bust' : 'Chest';
    const measurementValue = isWomen ? (bust ? bust[1] : '[BUST]') : (chest ? chest[1] : '[CHEST]');
    const sleeveVal = sleeveless ? 'N/A' : (sleeve ? sleeve[1] : '[SLEEVE]');

    const title = lower.split(" ").slice(0, 6).join(" ") + " listing";

    const draft = `
${title}

Circa [YEAR RANGE] Vintage
[BRAND]
[MATERIAL] / Made in [COUNTRY]

Tagged size [TAGGED SIZE] (${isWomen ? 'Womens' : 'Mens'}) – In my opinion, item fits somewhere around a [FIT ESTIMATE]

Measurements taken flat in inches, following Grailed guidelines:
${measurementLabel}: ${measurementValue}
Length: ${length ? length[1] : '[LENGTH]'}
Shoulder: ${shoulder ? shoulder[1] : '[SHOULDER]'}
Sleeve: ${sleeveVal}

Flaws / Condition:
[CONDITION NOTES]

AS ALWAYS: Check all photos carefully and read the description fully for info and condition. Item comes as shown and described. Check measurements for sizing, all measurements taken according to Grailed guidelines. Message me with any questions prior to purchase. I typically ship on Mondays and Fridays, and sometimes Wednesdays. All sales are final but please contact me directly if there are any issues with your order.`;

    setFormData({
      gender: isWomen ? 'Womens' : 'Mens',
      chest: chest ? chest[1] : '',
      bust: bust ? bust[1] : '',
      length: length ? length[1] : '',
      shoulder: shoulder ? shoulder[1] : '',
      sleeve: sleeveVal,
      title,
      draft
    });

    setListing(draft);
  };

  const finalizeListing = async () => {
    setArchive([...archive, formData]);
    setFormData({});
    setTranscript('');
    setListing('');

    try {
      await fetch('https://script.google.com/macros/s/AKfycbz_Tu8zGA6VlvTDhOLoqsTaN0w5WJPjCRoUMhYlPji__4xmu3m-8bLIgVCTifC1UugutA/exec', {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: formData.draft })
      });
    } catch (error) {
      console.error('Error sending to Google Docs:', error);
    }
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Voice Listing Drafting Tool</h1>

      {!template ? (
        <div className="mb-6">
          <label className="block mb-2 font-medium">Select Template</label>
          <select
            onChange={(e) => setTemplate(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">-- Choose Template --</option>
            <option value="upperwear">Upperwear / Tops</option>
          </select>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <button
                className="mb-4 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={startListening}
                disabled={listening}
              >
                {listening ? 'Listening...' : 'Start Dictation'}
              </button>
              <p className="text-sm text-gray-700 mb-4">Transcript: {transcript}</p>
              <div className="space-y-2">
                <div><strong>Gender:</strong> {formData.gender}</div>
                <div><strong>{formData.gender === 'Womens' ? 'Bust' : 'Chest'}:</strong> {formData.chest || formData.bust}</div>
                <div><strong>Length:</strong> {formData.length}</div>
                <div><strong>Shoulder:</strong> {formData.shoulder}</div>
                <div><strong>Sleeve:</strong> {formData.sleeve}</div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
              {listing || '[Listing will appear here]'}
              <div className="mt-4">
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded"
                  onClick={finalizeListing}
                >
                  Finish Listing & Start New
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              className="px-4 py-2 bg-gray-800 text-white rounded"
              onClick={() => setShowArchive(!showArchive)}
            >
              {showArchive ? 'Hide Archive' : 'Show All Drafts'}
            </button>
            {showArchive && (
              <div className="mt-4 space-y-4">
                {archive.map((item, index) => (
                  <div key={index} className="p-4 border rounded bg-white whitespace-pre-wrap">
                    {item.draft}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
