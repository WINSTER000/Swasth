const axios = require('axios');

class GeminiAIProvider {
  constructor(apiKey) {
    this.name = 'GeminiAIProvider';
    this.apiKey = apiKey;
    this.apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  }

  async processAssistantQuery({ message, language = 'en', patientContext = {} }) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured.');
    }

    const langInstructions = {
      en: 'Respond in clear, empathetic English.',
      hi: 'उत्तर स्पष्ट और सरल हिन्दी में दें।',
      mr: 'उत्तर सोप्या आणि स्पष्ट मराठीत द्या.',
    };

    const prompt = `You are SWASTH AI Health Assistant, an empathetic, highly knowledgeable clinical guidance assistant for rural and semi-urban patients in India.
Language: ${langInstructions[language] || langInstructions.en}
User Question: "${message}"

Guidelines:
1. Provide practical, accurate, evidence-based health guidance and navigation advice for Indian rural healthcare (PHCs, CHCs, District Hospitals, Asha workers, ANM).
2. If the user describes emergency red flag symptoms (severe chest pain, extreme breathlessness, severe bleeding, loss of consciousness, stroke signs), immediately highlight EMERGENCY NOTICE and recommend dialing 108 or visiting the nearest hospital emergency ward.
3. Keep answers well-structured with clear bullet points, practical home-care advice, when to see a doctor, and questions to ask.
4. End with an informational disclaimer that this does not replace in-person doctor diagnosis.`;

    const res = await axios.post(
      this.apiUrl,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 600,
        },
      },
      { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
    );

    const replyText =
      res.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I am here to assist with health guidance and facility information.';

    const lower = message.toLowerCase();
    const isEmergency =
      lower.includes('chest pain') ||
      lower.includes('heart attack') ||
      lower.includes('cannot breathe') ||
      lower.includes('unconscious') ||
      lower.includes('heavy bleeding');

    return {
      text: replyText,
      language,
      disclaimer:
        language === 'hi'
          ? 'एआई सहायता केवल सूचनात्मक है और पेशेवर चिकित्सा देखभाल का विकल्प नहीं है।'
          : language === 'mr'
          ? 'एआय मदत केवळ माहितीसाठी आहे आणि व्यावसायिक वैद्यकीय उपचारांचा पर्याय नाही.'
          : 'AI assistance is informational and does not replace professional medical care.',
      isEmergency,
      suggestedQuestions:
        language === 'hi'
          ? ['अपॉइंटमेंट कैसे बुक करें?', 'निकटतम स्वास्थ्य केंद्र कहाँ है?', 'निःशुल्क दवाएं क्या उपलब्ध हैं?']
          : language === 'mr'
          ? ['अपॉइंटमेंट कशी बुक करावी?', 'जवळचे आरोग्य केंद्र कुठे आहे?', 'कोणती औषधे उपलब्ध आहेत?']
          : ['How to book an appointment?', 'Where is the nearest PHC / Hospital?', 'Check medicine availability'],
    };
  }

  async processDigitalTriage(params) {
    throw new Error('Fallback to MockAIProvider.');
  }

  async processRecordSummary(params) {
    throw new Error('Fallback to MockAIProvider.');
  }

  async processReferralSummary(params) {
    throw new Error('Fallback to MockAIProvider.');
  }

  async processRiskAssessment(params) {
    throw new Error('Fallback to MockAIProvider.');
  }
}

module.exports = GeminiAIProvider;

