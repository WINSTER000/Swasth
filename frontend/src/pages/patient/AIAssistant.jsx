import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  Bot,
  Send,
  Trash2,
  AlertOctagon,
  User,
  Loader2,
  Volume2,
  VolumeX,
  Hospital,
  Thermometer,
  Droplets,
  Heart,
  Calendar,
  Clock,
  Pill,
  Sparkles,
  Languages,
  ShieldCheck,
  PhoneCall,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const AIAssistant = () => {
  const { i18n, t } = useTranslation('ai');
  const [currentLang, setCurrentLang] = useState(i18n.language || 'en');
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const initialGreeting = {
    en: "Hello! I am SWASTH AI Health Assistant.\n\nI am your unified clinical guidance and navigation companion for Indian rural and public healthcare:\n\n• 🏥 Find Nearest PHCs, CHCs, & District Hospitals with routes\n• 📅 Book OPD Consultation Tokens\n• ⏱️ Track Real-time Live Queues & wait times\n• 💊 Government Free Medicine Stock & Guidelines\n• 🌡️ Evidence-Based Guidance for Fever, BP, Diabetes, & Dehydration\n\nHow can I assist you with your health today?",
    hi: "नमस्ते! मैं स्वास्थ्य एआई स्वास्थ्य सहायक (SWASTH AI) हूँ।\n\nमैं आपकी निम्नलिखित स्वास्थ्य सेवाओं में पूरी सहायता कर सकता हूँ:\n\n• 🏥 निकटतम PHC, CHC और जिला अस्पताल खोजना\n• 📅 ओपीडी अपॉइंटमेंट और लाइव टोकन बुकिंग\n• ⏱️ लाइव कतार (Queue) स्थिति और प्रतीक्षा समय\n• 💊 सरकारी निःशुल्क दवाओं की जानकारी\n• 🌡️ बुखार, सर्दी, बीपी, शुगर और प्राथमिक उपचार\n\nकृपया अपना प्रश्न या लक्षण बताएं!",
    mr: "नमस्कार! मी स्वास्थ एआय आरोग्य सहाय्यक (SWASTH AI) आहे.\n\nमी तुम्हाला पुढील सर्व आरोग्य सेवांमध्ये मदत करू शकेन:\n\n• 🏥 जवळचे प्राथमिक आरोग्य केंद्र (PHC) व रुग्णालय शोधणे\n• 📅 ओपीडी टोकन व अपॉइंटमेंट बुकिंग\n• ⏱️ थेट रांग (Live Queue) ट्रॅकिंग व प्रतीक्षा वेळ\n• 💊 शासकीय मोफत औषधांची माहिती\n• 🌡️ ताप, खोकला, बीपी, शुगर व प्रथमोपचार मार्गदर्शन\n\nकृपया तुमचा प्रश्न येथे विचारा!",
  };

  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: initialGreeting[currentLang] || initialGreeting.en,
      suggestedQuestions:
        currentLang === 'hi'
          ? ['निकटतम स्वास्थ्य केंद्र कहाँ है?', 'ओपीडी अपॉइंटमेंट कैसे बुक करें?', 'बुखार और सर्दी में क्या करें?', 'दवा उपलब्धता जांचें']
          : currentLang === 'mr'
          ? ['जवळचे आरोग्य केंद्र कुठे आहे?', 'अपॉइंटमेंट कशी बुक करावी?', 'ताप व सर्दीवर घरगुती उपाय काय?', 'मोफत औषध उपलब्धता']
          : ['Where is the nearest PHC?', 'How to book an appointment?', 'Fever & cold home care guidelines', 'Check medicine availability'],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleLanguageChange = (langKey) => {
    setCurrentLang(langKey);
    i18n.changeLanguage(langKey);
    setMessages((prev) => [
      ...prev,
      {
        sender: 'ai',
        text: initialGreeting[langKey] || initialGreeting.en,
        suggestedQuestions:
          langKey === 'hi'
            ? ['निकटतम स्वास्थ्य केंद्र कहाँ है?', 'ओपीडी अपॉइंटमेंट कैसे बुक करें?', 'बुखार और सर्दी में क्या करें?']
            : langKey === 'mr'
            ? ['जवळचे आरोग्य केंद्र कुठे आहे?', 'अपॉइंटमेंट कशी बुक करावी?', 'ताप व सर्दीवर घरगुती उपाय काय?']
            : ['Where is the nearest PHC?', 'How to book an appointment?', 'Fever & cold home care guidelines'],
      },
    ]);
  };

  const handleSpeak = (text, index) => {
    if (!window.speechSynthesis) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#•_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'mr' ? 'mr-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingIndex(null);
    utterance.onerror = () => setSpeakingIndex(null);

    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (queryText) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/ai/assistant', {
        message: textToSend,
        language: currentLang,
      });

      const aiMsg = {
        sender: 'ai',
        text: res.data.text,
        disclaimer: res.data.disclaimer,
        isEmergency: res.data.isEmergency,
        suggestedQuestions: res.data.suggestedQuestions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text:
            currentLang === 'hi'
              ? 'क्षमा करें, AI सेवा से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।'
              : currentLang === 'mr'
              ? 'क्षमस्व, AI सेवेला कनेक्ट करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.'
              : 'Apologies, I encountered an issue connecting to the AI Service. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingIndex(null);
    setMessages([
      {
        sender: 'ai',
        text: initialGreeting[currentLang] || initialGreeting.en,
        suggestedQuestions:
          currentLang === 'hi'
            ? ['निकटतम स्वास्थ्य केंद्र कहाँ है?', 'ओपीडी अपॉइंटमेंट कैसे बुक करें?']
            : currentLang === 'mr'
            ? ['जवळचे आरोग्य केंद्र कुठे आहे?', 'अपॉइंटमेंट कशी बुक करावी?']
            : ['Where is the nearest PHC?', 'How to book an appointment?'],
      },
    ]);
  };

  // Quick Topic Chips
  const quickTopics = [
    { label: currentLang === 'hi' ? '🏥 निकटतम अस्पताल' : currentLang === 'mr' ? '🏥 जवळचे रुग्णालय' : '🏥 Nearest PHC / Hospital', query: currentLang === 'hi' ? 'निकटतम प्राथमिक स्वास्थ्य केंद्र कहाँ है?' : currentLang === 'mr' ? 'जवळचे प्राथमिक आरोग्य केंद्र कुठे आहे?' : 'Where is the nearest PHC / Hospital?' },
    { label: currentLang === 'hi' ? '📅 अपॉइंटमेंट बुकिंग' : currentLang === 'mr' ? '📅 अपॉइंटमेंट बुकिंग' : '📅 Book OPD Token', query: currentLang === 'hi' ? 'ओपीडी अपॉइंटमेंट कैसे बुक करें?' : currentLang === 'mr' ? 'ओपीडी अपॉइंटमेंट कशी बुक करावी?' : 'How to book an OPD appointment token?' },
    { label: currentLang === 'hi' ? '⏱️ लाइव कतार' : currentLang === 'mr' ? '⏱️ थेट रांग' : '⏱️ Live Queue Tracker', query: currentLang === 'hi' ? 'लाइव कतार ट्रैकर कैसे काम करता है?' : currentLang === 'mr' ? 'थेट रांग ट्रॅकर कसा काम करतो?' : 'How does Live Queue Tracker work?' },
    { label: currentLang === 'hi' ? '🌡️ बुखार और सर्दी' : currentLang === 'mr' ? '🌡️ ताप व सर्दी' : '🌡️ Fever & Cold Care', query: currentLang === 'hi' ? 'बुखार और सर्दी में क्या करना चाहिए?' : currentLang === 'mr' ? 'ताप व सर्दी असल्यास काय काळजी घ्यावी?' : 'What are home care guidelines for fever and viral cold?' },
    { label: currentLang === 'hi' ? '💧 ओआरएस और दस्त' : currentLang === 'mr' ? '💧 ओआरएस व जुलाब' : '💧 ORS & Diarrhea', query: currentLang === 'hi' ? 'ओआरएस (ORS) कैसे तैयार करें और दस्त में क्या करें?' : currentLang === 'mr' ? 'ORS कसे बनवावे आणि जुलाबामध्ये काय काळजी घ्यावी?' : 'How to prepare ORS and manage diarrhea?' },
    { label: currentLang === 'hi' ? '❤️ बीपी नियंत्रण' : currentLang === 'mr' ? '❤️ बीपी नियंत्रण' : '❤️ Blood Pressure Tips', query: currentLang === 'hi' ? 'हाई ब्लड प्रेशर को कैसे नियंत्रित करें?' : currentLang === 'mr' ? 'रक्तदाब (BP) नियंत्रणात कसा ठेवावा?' : 'How to manage high blood pressure and hypertension?' },
    { label: currentLang === 'hi' ? '💊 निःशुल्क दवाएं' : currentLang === 'mr' ? '💊 मोफत औषधे' : '💊 Free Medicines', query: currentLang === 'hi' ? 'सरकारी स्वास्थ्य केंद्र पर कौन सी निःशुल्क दवाएं मिलती हैं?' : currentLang === 'mr' ? 'सरकारी प्राथमिक केंद्रांवर कोणती मोफत औषधे मिळतात?' : 'What essential medicines are free at public PHCs?' },
    { label: currentLang === 'hi' ? '🚨 आपातकालीन 108' : currentLang === 'mr' ? '🚨 आणीबाणी 108' : '🚨 Emergency SOS 108', query: currentLang === 'hi' ? 'आपातकालीन स्थिति और 108 एम्बुलेंस की जानकारी दें' : currentLang === 'mr' ? 'आणीबाणी परिस्थिती व 108 रुग्णवाहिकेची माहिती द्या' : 'What to do in a medical emergency and how to call 108 ambulance?' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-brand-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-brand-500/20">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                SWASTH AI Health Assistant
              </h2>
              <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-500" /> Active Assistant
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multilingual Clinical Navigation & Patient Guidance (English • हिन्दी • मराठी)
            </p>
          </div>
        </div>

        {/* Top Controls: Language Switcher & Clear */}
        <div className="flex items-center space-x-2">
          {/* Language Selector */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold">
            {[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिन्दी' },
              { id: 'mr', label: 'मराठी' },
            ].map((l) => (
              <button
                key={l.id}
                onClick={() => handleLanguageChange(l.id)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  currentLang === l.id
                    ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" icon={Trash2} onClick={clearChat} className="text-xs shadow-xs">
            Clear
          </Button>
        </div>
      </div>

      {/* Quick Topic Chips Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-thin">
        {quickTopics.map((topic, i) => (
          <button
            key={i}
            onClick={() => handleSend(topic.query)}
            className="px-3 py-1.5 bg-white dark:bg-slate-800/90 hover:bg-brand-50 dark:hover:bg-brand-950/50 border border-slate-200 dark:border-slate-700 hover:border-brand-300 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl shadow-xs whitespace-nowrap transition-all cursor-pointer flex-shrink-0"
          >
            {topic.label}
          </button>
        ))}
      </div>

      {/* Main Chat Window */}
      <div className="bg-white dark:bg-slate-800/95 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-md h-[560px] flex flex-col overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';

            return (
              <div
                key={index}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-2xl flex items-center justify-center font-bold text-xs shadow-xs flex-shrink-0 ${
                    isUser
                      ? 'bg-brand-600 text-white'
                      : msg.isEmergency
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-900 text-brand-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-xl p-4 rounded-3xl text-xs leading-relaxed shadow-xs space-y-2 ${
                    isUser
                      ? 'bg-brand-600 text-white rounded-tr-xs'
                      : msg.isEmergency
                      ? 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-100 rounded-tl-xs'
                      : 'bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-tl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed">{msg.text}</p>

                  {/* Audio Read-Out Button for AI Message */}
                  {!isUser && (
                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/60 dark:border-slate-700/60">
                      <button
                        onClick={() => handleSpeak(msg.text, index)}
                        className="flex items-center space-x-1 text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline cursor-pointer"
                      >
                        {speakingIndex === index ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                            <span className="text-rose-500">Stop Reading</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen Audio (आवाज ऐका)</span>
                          </>
                        )}
                      </button>

                      <span className="text-[10px] text-slate-400 font-semibold">SWASTH Clinical AI</span>
                    </div>
                  )}

                  {/* Suggested Follow-up Questions */}
                  {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700/80 space-y-1.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Suggested Questions:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedQuestions.map((q, qIdx) => (
                          <button
                            key={qIdx}
                            onClick={() => handleSend(q)}
                            className="px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 border border-slate-300 dark:border-slate-600 hover:border-brand-400 text-slate-700 dark:text-slate-200 rounded-xl text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center space-x-2.5 text-xs text-slate-500 dark:text-slate-400 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-2xl w-max border border-slate-200 dark:border-slate-700">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600" />
              <span className="font-semibold">SWASTH AI is analyzing clinical guidelines...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 flex items-center space-x-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              currentLang === 'hi'
                ? 'अस्पताल, अपॉइंटमेंट, दवा या लक्षणों के बारे में पूछें...'
                : currentLang === 'mr'
                ? 'रुग्णालय, टोकन, औषध किंवा लक्षणांबद्दल विचारा...'
                : 'Ask about facilities, OPD token booking, medicines, or symptoms...'
            }
            disabled={loading}
            className="flex-1 px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-slate-100 shadow-xs"
          />
          <Button
            variant="primary"
            size="md"
            onClick={() => handleSend()}
            loading={loading}
            icon={Send}
            className="rounded-2xl px-5"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

