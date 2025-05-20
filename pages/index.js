import { useState } from 'react';

export default function VoiceListingApp() {
  const [template, setTemplate] = useState('');
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [formData, setFormData] = useState({
    gender: '',
    itemType: '',
    size: '',
    color: '',
    title: '',
    era: '',
    brand: '',
    madeIn: '',
    material: '',
    taggedSize: '',
    fitEstimate: '',
    chest: '',
    length: '',
    shoulder: '',
    sleeve: '',
    condition: '',
    description: '',
    notes: ''
  });

  const handleChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    setListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      setFormData(prev => ({ ...prev, description: result }));
    };

    recognition.onend = () => setListening(false);
  };

  const defaultFields = [
    { name: 'gender', placeholder: 'Listing Gender (Mens/Womens)' },
    { name: 'itemType', placeholder: 'Listing Item Type' },
    { name: 'size', placeholder: 'Listing as Size' },
    { name: 'color', placeholder: 'Listing Colour' },
    { name: 'title', placeholder: 'Listing Title' }
  ];

  const fieldStyle = (value) => `p-2 border rounded ${value ? 'bg-white' : 'bg-red-100'}`;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Voice Listing Drafting Tool</h1>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {defaultFields.map(({ name, placeholder }) => (
          <input
            key={name}
            type="text"
            placeholder={placeholder}
            value={formData[name]}
            onChange={handleChange(name)}
            className={fieldStyle(formData[name])}
          />
        ))}
      </div>

      <textarea
        rows={3}
        placeholder="Item - colour"
        value={formData.notes}
        onChange={handleChange('notes')}
        className="w-full p-2 border mb-4"
      />

      <div className="whitespace-pre-wrap bg-white border p-4 shadow-md">
        {formData.title ? `**${formData.title}**\n\n` : '**Item Title**\n\n'}
        HERE

        {formData.era || 'Circa ???? Vintage'}
        {formData.brand || 'BRAND NAME'}
        {formData.madeIn ? `Made in ${formData.madeIn}` : 'Made in ????'}
        {formData.material || 'Material'}

        Tagged size {formData.taggedSize || '[TAGGED SIZE]'} - In my opinion, item fits somewhere around a {formData.gender || 'Mens'} {formData.size || 'BLAH'}

        Measurements (TAKEN LAYING FLAT, IN INCHES)
        Chests: {formData.chest || ''}
        Length: {formData.length || ''}
        Shoulder: {formData.shoulder || ''}
        Sleeve Length: {formData.sleeve || ''}

        Condition/ Flaws: {formData.condition || ''}

        {formData.description}

        AS ALWAYS: Check all photos carefully and read the description fully for info and condition. Item comes as shown and described. Check measurements for sizing, all measurements taken according to Grailed guidelines. Message me with any questions prior to purchase. I typically ship on Mondays and Fridays, and sometimes Wednesdays. All sales are final but please contact me directly if there are any issues with your order.
        -------------------------------------------------------------------------------------------------------------
      </div>

      <div className="mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={startListening}
          disabled={listening}
        >
          {listening ? 'Listening...' : 'Start Dictation'}
        </button>
        <textarea
          placeholder="Manual entry or override input"
          rows={4}
          value={transcript}
          onChange={(e) => {
            setTranscript(e.target.value);
            setFormData(prev => ({ ...prev, description: e.target.value }));
          }}
          className="w-full p-2 border mt-2"
        />
      </div>
    </div>
  );
}
