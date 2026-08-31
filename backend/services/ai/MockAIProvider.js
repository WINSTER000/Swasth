/**
 * MockAIProvider
 * Comprehensive Medical Guidance and Healthcare Platform Intelligence
 * Supports English (en), Hindi (hi), and Marathi (mr) with live database integration.
 */
class MockAIProvider {
  constructor() {
    this.name = 'MockAIProvider';
  }

  // 1. AI Health Assistant
  async processAssistantQuery({ message, language = 'en', patientContext = {} }) {
    const lang = ['hi', 'mr'].includes(language) ? language : 'en';
    const lowerMsg = (message || '').toLowerCase().trim();

    // Fetch dynamic facilities from DB if available
    let dynamicFacilities = [];
    try {
      const mongoose = require('mongoose');
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const Facility = require('../../models/Facility');
        dynamicFacilities = await Facility.find({}).limit(5).select('name type district address phone').lean();
      }
    } catch (e) {
      // fallback
    }

    const facilityListEn = dynamicFacilities.length > 0
      ? dynamicFacilities.map((f, i) => `${i + 1}. **${f.name}** (${f.type || 'Hospital'})\n   📍 ${f.address || f.district || 'Rural Center'}${f.phone ? ` • 📞 ${f.phone}` : ''}`).join('\n\n')
      : "1. **Shirwal Primary Health Centre (PHC)** — Shirwal, Satara (24x7 OPD)\n2. **Mangal Murti Hospital and Polyclinic** — Satara Road (OPD & Specialty)\n3. **Satara District General Hospital** — Satara City (Tertiary ICU & Trauma Care)";

    const facilityListHi = dynamicFacilities.length > 0
      ? dynamicFacilities.map((f, i) => `${i + 1}. **${f.name}** (${f.type || 'अस्पताल'})\n   📍 ${f.address || f.district || 'स्वास्थ्य केंद्र'}${f.phone ? ` • 📞 ${f.phone}` : ''}`).join('\n\n')
      : "1. **शिरवल प्राथमिक स्वास्थ्य केंद्र (PHC)** — 24x7 ओपीडी सेवा\n2. **मंगल मूर्ति हॉस्पिटल और पॉलीक्लिनिक** — विशेषज्ञ परामर्श\n3. **सतारा जिला सामान्य अस्पताल** — आईसीयू और आपातकालीन सेवा";

    const facilityListMr = dynamicFacilities.length > 0
      ? dynamicFacilities.map((f, i) => `${i + 1}. **${f.name}** (${f.type || 'रुग्णालय'})\n   📍 ${f.address || f.district || 'आरोग्य केंद्र'}${f.phone ? ` • 📞 ${f.phone}` : ''}`).join('\n\n')
      : "1. **शिरवळ प्राथमिक आरोग्य केंद्र (PHC)** — 24x7 ओपीडी\n2. **मंगलमूर्ती हॉस्पिटल आणि पॉलिक्लिनिक** — तज्ज्ञ डॉक्टर तपासणी\n3. **सातारा जिल्हा सामान्य रुग्णालय** — अतिदक्षता (ICU) व आणीबाणी सेवा";

    let replyText = '';
    let isEmergency = false;
    let suggestedQuestions = [];

    // --- Intent Matching & High-Fidelity Responses ---

    // Emergency Red Flags
    if (
      lowerMsg.includes('chest pain') ||
      lowerMsg.includes('heart attack') ||
      lowerMsg.includes('cannot breathe') ||
      lowerMsg.includes('breathless') ||
      lowerMsg.includes('unconscious') ||
      lowerMsg.includes('heavy bleeding') ||
      lowerMsg.includes('snake') ||
      lowerMsg.includes('poison') ||
      lowerMsg.includes('छातीत') ||
      lowerMsg.includes('सांस') ||
      lowerMsg.includes('आपातकालीन') ||
      lowerMsg.includes('आणीबाणी') ||
      lowerMsg.includes('रक्तस्त्राव')
    ) {
      isEmergency = true;
      if (lang === 'hi') {
        replyText = `🚨 **आपातकालीन चेतावनी (EMERGENCY NOTICE)**:\n\nयदि आपको या मरीज को सीने में तेज दर्द, सांस लेने में अत्यधिक तकलीफ, भारी रक्तस्राव, बेहोशी या सर्पदंश हुआ है:\n\n1. **तुरंत 108 (राष्ट्रीय एम्बुलेंस सेवा) पर कॉल करें।**\n2. मरीज को शांत रखें, तंग कपड़े ढीले करें और बैठने की आरामदायक स्थिति में रखें।\n3. निकटतम 24x7 आपातकालीन ट्रॉमा वार्ड या जिला अस्पताल में तुरंत पहुंचें।\n\n🏥 **निकटतम आपातकालीन केंद्र**: सतारा जिला सामान्य अस्पताल (24x7 Emergency)`;
        suggestedQuestions = ['एम्बुलेंस 108 कैसे बुलाएं?', 'निकटतम आईसीयू अस्पताल कहाँ है?', 'प्राथमिक उपचार के नियम'];
      } else if (lang === 'mr') {
        replyText = `🚨 **आणीबाणी सूचना (EMERGENCY NOTICE)**:\n\nजर रुग्णाला छातीत तीव्र वेदना, श्वास घेण्यास अडचण, चक्कर येणे, जास्त रक्तस्त्राव किंवा सर्पदंश झाला असेल तर:\n\n1. **त्वरित 108 (राष्ट्रीय रुग्णवाहिका सेवा) वर संपर्क साधा.**\n2. रुग्णाला शांत बसवून हवेशीर जागेत ठेवा.\n3. जवळच्या 24x7 आणीबाणी अपघात विभाग किंवा जिल्हा रुग्णालयात त्वरित दाखल करा.\n\n🏥 **जवळचे आणीबाणी केंद्र**: सातारा जिल्हा सामान्य रुग्णालय (24x7 ICU)`;
        suggestedQuestions = ['रुग्णवाहिका 108 कशी बोलवावी?', 'जवळचे ICU रुग्णालय कुठे आहे?', 'प्रथम उपचारांची माहिती'];
      } else {
        replyText = `🚨 **EMERGENCY MEDICAL ALERT**:\n\nIf you or the patient are experiencing severe chest pain, acute shortness of breath, heavy bleeding, loss of consciousness, or suspected poisoning/snakebite:\n\n1. **Immediately dial 108 for National Ambulance Services.**\n2. Keep the patient in a comfortable seated position with airflow.\n3. Head directly to the nearest 24x7 District Hospital Trauma & Emergency Ward.\n\n🏥 **Nearest Emergency Facility**: Satara District General Hospital (24x7 Emergency & ICU)`;
        suggestedQuestions = ['How to call 108 Ambulance?', 'Nearest 24x7 ICU Hospital', 'First-Aid Guidance'];
      }
    }

    // Facilities & Hospitals Locator
    else if (
      lowerMsg.includes('nearest') ||
      lowerMsg.includes('phc') ||
      lowerMsg.includes('hospital') ||
      lowerMsg.includes('clinic') ||
      lowerMsg.includes('where is') ||
      lowerMsg.includes('find') ||
      lowerMsg.includes('कहाँ') ||
      lowerMsg.includes('कुठे') ||
      lowerMsg.includes('दवाखाना') ||
      lowerMsg.includes('रुग्णालय')
    ) {
      if (lang === 'hi') {
        replyText = `🏥 **आपके निकटतम स्वास्थ्य केंद्र और अस्पताल**:\n\n${facilityListHi}\n\n💡 **सलाह**: आप 'स्वास्थ्य सेवा खोजें' टैब से लाइव ओपीडी टोकन बुक कर सकते हैं और वास्तविक दूरी व दिशा-निर्देश देख सकते हैं।`;
        suggestedQuestions = ['ओपीडी अपॉइंटमेंट कैसे बुक करें?', 'निःशुल्क दवाएं क्या उपलब्ध हैं?', 'लाइव कतार में टोकन कैसे देखें?'];
      } else if (lang === 'mr') {
        replyText = `🏥 **तुमच्या जवळची प्राथमिक आरोग्य केंद्रे व रुग्णालये**:\n\n${facilityListMr}\n\n💡 **मार्गदर्शन**: तुम्ही 'आरोग्य केंद्रे शोधा' विभागात जाऊन त्वरित ओपीडी टोकन बुक करू शकता व थेट अंतर आणि मार्ग पाहू शकता.`;
        suggestedQuestions = ['अपॉइंटमेंट कशी बुक करावी?', 'कोणती मोफत औषधे उपलब्ध आहेत?', 'थेट रांगेत नंबर कसा पाहावा?'];
      } else {
        replyText = `🏥 **Healthcare Facilities & Hospitals in Your Area**:\n\n${facilityListEn}\n\n💡 **Tip**: Navigate to the **Find PHC & Hospitals** page to check live bed availability, view Google Maps driving routes, and book an instant OPD token.`;
        suggestedQuestions = ['How to book an appointment?', 'Check free medicine availability', 'How to track live queue?'];
      }
    }

    // Appointment Booking
    else if (
      lowerMsg.includes('appointment') ||
      lowerMsg.includes('book') ||
      lowerMsg.includes('slot') ||
      lowerMsg.includes('अपॉइंटमेंट') ||
      lowerMsg.includes('बुक') ||
      lowerMsg.includes('वेळ') ||
      lowerMsg.includes('नंबर')
    ) {
      if (lang === 'hi') {
        replyText = `📅 **ओपीडी अपॉइंटमेंट बुक करने की प्रक्रिया**:\n\n1. **अस्पताल चुनें**: 'स्वास्थ्य सेवा खोजें' टैब पर जाएं और अपनी पसंद का PHC, CHC या अस्पताल चुनें।\n2. **बुक बटन दबाएं**: 'Book OPD Appointment' पर क्लिक करें।\n3. **विभाग और समय चुनें**: जनरल मेडिसिन, बाल रोग या मातृ स्वास्थ्य विभाग चुनें।\n4. **टोकन प्राप्त करें**: बुकिंग की पुष्टि के बाद आपको लाइव टोकन नंबर (जैसे #101) मिलेगा जिसे आप 'लाइव कतार ट्रैकर' में देख सकते हैं।`;
        suggestedQuestions = ['निकटतम स्वास्थ्य केंद्र कहाँ है?', 'लाइव कतार ट्रैकर क्या है?', 'टेलीकंसल्टेशन कैसे शुरू करें?'];
      } else if (lang === 'mr') {
        replyText = `📅 **ओपीडी अपॉइंटमेंट बुकिंग प्रक्रिया**:\n\n1. **रुग्णालय निवडा**: 'आरोग्य केंद्रे शोधा' वर जा आणि तुमचे जवळचे PHC किंवा रुग्णालय निवडा.\n2. **बुक वर क्लिक करा**: 'Book OPD Appointment' बटण दाबा.\n3. **तपासणी विभाग निवडा**: जनरल मेडिसिन, बालरोग किंवा प्रसूती विभाग निवडा.\n4. **टोकन मिळवा**: तुम्हाला थेट टोकन क्रमांक (उदा. #101) मिळेल, जो तुम्ही 'थेट रांग ट्रॅकर' मध्ये तपासू शकता.`;
        suggestedQuestions = ['जवळचे रुग्णालय कुठे आहे?', 'थेट रांग ट्रॅकर कसा वापरावा?', 'व्हिडिओ डॉक्टर तपासणी कशी करावी?'];
      } else {
        replyText = `📅 **How to Book an OPD Appointment**:\n\n1. **Choose Facility**: Go to the **Find PHC & Hospitals** section and select your nearest PHC, CHC, or District Hospital.\n2. **Select Book**: Click on **Book OPD Appointment**.\n3. **Pick Department & Date**: Choose General Medicine, Maternal & Child Health, or Pediatrics.\n4. **Get Instant Token**: Your confirmed token number (e.g. #101) will be generated and synchronized with the **Live Queue Tracker**.`;
        suggestedQuestions = ['Where is the nearest PHC?', 'How does Live Queue Tracker work?', 'How to start a Teleconsult call?'];
      }
    }

    // Fever / Temperature / Dengue / Malaria
    else if (
      lowerMsg.includes('fever') ||
      lowerMsg.includes('temperature') ||
      lowerMsg.includes('dengue') ||
      lowerMsg.includes('malaria') ||
      lowerMsg.includes('ताप') ||
      lowerMsg.includes('बुखार') ||
      lowerMsg.includes('ठंड')
    ) {
      if (lang === 'hi') {
        replyText = `🌡️ **बुखार और वायरल संक्रमण प्रबंधन मार्गदर्शन**:\n\n• **हाइड्रेशन**: प्रचुर मात्रा में ओआरएस (ORS), नारियल पानी और गुनगुना पानी पिएं।\n• **दवा**: डॉक्टर की सलाह अनुसार पैरासिटामोल 500mg (Paracetamol) भोजन के बाद लें (दिन में 3 बार से अधिक नहीं)।\n• **सावधानी**: एस्पिरिन या ब्रूफेन बिना डॉक्टर की सलाह के न लें।\n• **जांच**: यदि बुखार 3 दिन से अधिक रहे, तो तुरंत नजदीकी PHC पर CBC और मलेरिया/डेंगू की रक्त जांच कराएं।`;
        suggestedQuestions = ['ओआरएस (ORS) कैसे तैयार करें?', 'निकटतम स्वास्थ्य केंद्र कहाँ है?', 'निःशुल्क दवाएं क्या हैं?'];
      } else if (lang === 'mr') {
        replyText = `🌡️ **ताप व संसर्ग नियंत्रण मार्गदर्शन**:\n\n• **पाणी व द्रवपदार्थ**: भरपूर ओआरएस (ORS), डाळिंब पाणी व कोमट पाणी प्या.\n• **औषधोपचार**: डॉक्टरांच्या सल्ल्यानुसार पॅरासिटामॉल 500mg जेवणानंतर घ्या.\n• **थंड पाण्याच्या पट्ट्या**: ताप 101°F पेक्षा जास्त असल्यास कपाळावर पाण्याच्या पट्ट्या ठेवा.\n• **तपासणी**: ताप 3 दिवसांपेक्षा जास्त राहिल्यास जवळच्या PHC मध्ये जाऊन सीबीसी (CBC) व मलेरिया/डेंग्यू रक्त तपासणी करा.`;
        suggestedQuestions = ['ओआरएस (ORS) कसे बनवावे?', 'जवळचे आरोग्य केंद्र कुठे आहे?', 'मोफत औषधे कोणती मिळतात?'];
      } else {
        replyText = `🌡️ **Fever & Viral Infection Care Guidelines**:\n\n• **Hydration**: Drink plenty of fluids (ORS, boiled cooled water, soups, tender coconut water).\n• **Medication**: Take Paracetamol 500mg after food if prescribed (max 3 times/day). Avoid self-medicating with antibiotics without clinical consult.\n• **Sponging**: Use normal water forehead sponging if temperature exceeds 101°F.\n• **When to visit PHC**: If fever persists for > 3 days, visit your local PHC for a Complete Blood Count (CBC) and Malaria/Dengue screening.`;
        suggestedQuestions = ['How to prepare ORS at home?', 'Where is the nearest PHC?', 'How to book an OPD token?'];
      }
    }

    // Diarrhea / Loose Motion / Vomiting / ORS
    else if (
      lowerMsg.includes('loose motion') ||
      lowerMsg.includes('diarrhea') ||
      lowerMsg.includes('vomit') ||
      lowerMsg.includes('ors') ||
      lowerMsg.includes('stomach') ||
      lowerMsg.includes('जुलाब') ||
      lowerMsg.includes('उलटी') ||
      lowerMsg.includes('दस्त') ||
      lowerMsg.includes('पेट')
    ) {
      if (lang === 'hi') {
        replyText = `💧 **दस्त, उल्टी और निर्जलीकरण (Dehydration) प्रबंधन**:\n\n• **ORS तैयार करने की विधि**: 1 लीटर साफ उबले हुए ठंडे पानी में 1 पैकेट ORS घोलें और 24 घंटे के अंदर पिएं।\n• **आहार**: हल्का भोजन जैसे खिचड़ी, केला, दही और चावल का मांड़ लें।\n• **जिंक की गोली**: बच्चों में 14 दिनों तक जिंक सप्लीमेंट बहुत जरूरी है।\n• **खतरे के लक्षण**: यदि लगातार उल्टी, अत्यधिक कमजोरी या पेशाब कम हो तो तुरंत PHC आपातकालीन वार्ड जाएं।`;
        suggestedQuestions = ['ओआरएस (ORS) पैकेट कहाँ मिलेगा?', 'निकटतम स्वास्थ्य केंद्र कहाँ है?', 'अपॉइंटमेंट कैसे बुक करें?'];
      } else if (lang === 'mr') {
        replyText = `💧 **जुलाब, उलटी व डिहायड्रेशन नियंत्रण मार्गदर्शन**:\n\n• **ORS तयार करण्याची पद्धत**: 1 लिटर उकळून थंड केलेल्या स्वच्छ पाण्यात 1 पाकीट ORS विरघळवून 24 तासांच्या आत थोडे-थोडे प्या.\n• **हलका आहार**: भाताची पेज, ताक, दही-भात व केळी खा.\n• **झिंक गोळ्या**: मुलांसाठी 14 दिवस झिंक सप्लिमेंट देणे आवश्यक आहे.\n• **धोक्याची लक्षणे**: सतत उलट्या किंवा लघवी कमी झाल्यास तात्काळ प्राथमिक आरोग्य केंद्रात जा.`;
        suggestedQuestions = ['ORS पाकीट कुठे मिळेल?', 'जवळचे आरोग्य केंद्र कुठे आहे?', 'डॉक्टर तपासणी कशी बुक करावी?'];
      } else {
        replyText = `💧 **Diarrhea, Vomiting & Dehydration Management**:\n\n• **ORS Preparation**: Dissolve 1 whole packet of ORS in 1 Liter of clean boiled & cooled water. Drink frequently throughout the day.\n• **Hydration & Diet**: Eat light foods like rice porridge (kanji), bananas, yogurt, and coconut water. Avoid oily/spicy food.\n• **Zinc Supplementation**: Recommended for children alongside ORS for 14 days.\n• **Red Flags**: If vomiting prevents fluid intake or there is blood in stool/extreme fatigue, visit your nearest PHC emergency room immediately.`;
        suggestedQuestions = ['Where to get free ORS packets?', 'Where is the nearest PHC?', 'Book an OPD Consultation'];
      }
    }

    // High Blood Pressure / Hypertension
    else if (
      lowerMsg.includes('bp') ||
      lowerMsg.includes('blood pressure') ||
      lowerMsg.includes('hypertension') ||
      lowerMsg.includes('रक्तदाब') ||
      lowerMsg.includes('बीपी')
    ) {
      if (lang === 'hi') {
        replyText = `❤️ **रक्तचाप (Blood Pressure) नियंत्रण मार्गदर्शन**:\n\n• **सामान्य स्तर**: सामान्य रक्तचाप 120/80 mmHg के आसपास होना चाहिए।\n• **नमक कम करें**: दैनिक नमक का सेवन 1 चम्मच (5 ग्राम) से कम रखें।\n• **दवा का नियम**: अपनी बीपी की दवा (जैसे Amlodipine/Telmisartan) रोजाना समय पर लें, कभी भी अचानक बंद न करें।\n• **जांच**: महीने में कम से कम एक बार नजदीकी PHC या हेल्थ एंड वेलनेस सेंटर पर बीपी चेक कराएं।`;
        suggestedQuestions = ['डिजिटल स्वास्थ्य रिकॉर्ड कैसे देखें?', 'निकटतम स्वास्थ्य केंद्र कहाँ है?', 'बीपी के लिए आहार नियम'];
      } else if (lang === 'mr') {
        replyText = `❤️ **रक्तदाब (Blood Pressure) नियंत्रण टिप्स**:\n\n• **नॉर्मल मर्यादा**: सामान्य रक्तदाब 120/80 mmHg च्या आसपास असावा.\n• **मिठाचे प्रमाण कमी करा**: दररोज जेवणात मीठ कमी वापरा.\n• **नियमित औषध**: डॉक्टरांनी दिलेली बीपीची गोळी दररोज वेळेवर घ्या, कधीही स्वतःहून बंद करू नका.\n• **नियमित तपासणी**: दरमहा जवळच्या प्राथमिक आरोग्य केंद्रात जाऊन मोफत रक्तदाब तपासा.`;
        suggestedQuestions = ['आरोग्य तपासणी अहवाल कसा पाहावा?', 'जवळचे रुग्णालय कुठे आहे?', 'आहार नियम काय आहेत?'];
      } else {
        replyText = `❤️ **Blood Pressure & Hypertension Management**:\n\n• **Normal Threshold**: Ideal blood pressure is ~120/80 mmHg. Persistent readings > 140/90 mmHg require clinical management.\n• **Dietary Sodium**: Reduce daily salt intake to under 1 teaspoon (< 5g/day).\n• **Medication Adherence**: Take prescribed antihypertensive medications daily at the same time without skipping doses.\n• **Surveillance**: Get your BP checked monthly at your local PHC or Ayushman Arogya Mandir.`;
        suggestedQuestions = ['How to view my Vitals History?', 'Where is the nearest PHC?', 'Book Follow-up Appointment'];
      }
    }

    // Diabetes / Blood Sugar
    else if (
      lowerMsg.includes('diabetes') ||
      lowerMsg.includes('sugar') ||
      lowerMsg.includes('glucose') ||
      lowerMsg.includes('मधुमेह') ||
      lowerMsg.includes('शुगर')
    ) {
      if (lang === 'hi') {
        replyText = `🩸 **मधुमेह (Diabetes) और ब्लड शुगर नियंत्रण**:\n\n• **शुगर का स्तर**: खाली पेट (Fasting) 70-100 mg/dL और खाने के बाद (PP) < 140 mg/dL सामान्य है।\n• **व्यायाम**: रोजाना 30 मिनट तेज गति से टहलें।\n• **हाइपोग्लाइसीमिया (कम शुगर)**: यदि अचानक पसीना, घबराहट या चक्कर आए, तो तुरंत आधा गिलास चीनी का पानी या फल का रस लें।\n• **जांच**: PHC पर 3 महीने में एक बार HbA1c टेस्ट अवश्य कराएं।`;
        suggestedQuestions = ['लैब टेस्ट रिपोर्ट कैसे देखें?', 'निकटतम स्वास्थ्य केंद्र कहाँ है?', 'निःशुल्क दवाएं क्या हैं?'];
      } else if (lang === 'mr') {
        replyText = `🩸 **मधुमेह (Diabetes) व रक्तातील साखर नियंत्रण**:\n\n• **साखरेची पातळी**: उपाशीपोटी (Fasting) 70-100 mg/dL आणि जेवणानंतर < 140 mg/dL सामान्य मानली जाते.\n• **चालणे**: दररोज किमान 30 मिनिटे वेगाने चालावे.\n• **लो शुगरची लक्षणे**: अचानक थरथरणे, चक्कर किंवा घाम आल्यास लगेच गोड पाणी किंवा साखर खा.\n• **तपासणी**: दर 3 महिन्यांनी प्राथमिक आरोग्य केंद्रात मोफत शुगर व HbA1c तपासा.`;
        suggestedQuestions = ['लॅब रिपोर्ट कसे पाहावे?', 'जवळचे आरोग्य केंद्र कुठे आहे?', 'मोफत औषध उपलब्धता'];
      } else {
        replyText = `🩸 **Diabetes & Blood Glucose Management**:\n\n• **Target Ranges**: Fasting Blood Sugar (FBS): 70–100 mg/dL; Post-Prandial (PP): < 140 mg/dL.\n• **Physical Activity**: Walk briskly for 30 minutes every day.\n• **Hypoglycemia (Low Sugar)**: If you experience trembling, sweating, or dizziness, immediately take a tablespoon of sugar, honey, or fruit juice.\n• **Diagnostic Review**: Get an HbA1c test conducted every 3 to 6 months at your local health center.`;
        suggestedQuestions = ['View my Diagnostic Reports', 'Where is the nearest PHC?', 'Check Metformin availability'];
      }
    }

    // Free Government Medicines & Formulary
    else if (
      lowerMsg.includes('medicine') ||
      lowerMsg.includes('stock') ||
      lowerMsg.includes('paracetamol') ||
      lowerMsg.includes('amoxicillin') ||
      lowerMsg.includes('दवा') ||
      lowerMsg.includes('औषध') ||
      lowerMsg.includes('गोळ्या')
    ) {
      if (lang === 'hi') {
        replyText = `💊 **सरकारी स्वास्थ्य केंद्रों पर उपलब्ध निःशुल्क दवाएं**:\n\n• **आवश्यक दवाएं**: पैरासिटामोल 500mg, अमोक्सिसिलिन 500mg, मेटफॉर्मिन 500mg, ओआरएस (ORS), आयरन एवं फोलिक एसिड (IFA), सेट्रिज़िन और एंटासिड सरकारी PHC/CHC पर **मुफ़्त** वितरित की जाती हैं।\n• **दवा लेने का नियम**: एंटीबायोटिक का कोर्स डॉक्टर द्वारा बताए अनुसार पूरा करें। दवा हमेशा भोजन के बाद पानी के साथ लें।`;
        suggestedQuestions = ['निकटतम स्वास्थ्य केंद्र कहाँ है?', 'प्रिस्क्रिप्शन कैसे देखें?', 'ओपीडी अपॉइंटमेंट कैसे बुक करें?'];
      } else if (lang === 'mr') {
        replyText = `💊 **शासकीय प्राथमिक आरोग्य केंद्रांवर मोफत उपलब्ध औषधे**:\n\n• **अत्यावश्यक औषधे**: पॅरासिटामॉल 500mg, अमॉक्सिसिलिन 500mg, मेटफॉर्मिन 500mg, ओआरएस (ORS), आयर्न-फॉलिक ॲसिड, सेट्रिझिन व अँटासिड सरकारी रुग्णालयात **विनामूल्य** मिळतात.\n• **औषध घेण्याचा नियम**: डॉक्टरांनी सांगितलेला पूर्ण डोस वेळेवर घ्या व रिकाम्या पोटी गोळ्या घेणे टाळा.`;
        suggestedQuestions = ['जवळचे आरोग्य केंद्र कुठे आहे?', 'माझी औषध प्रिस्क्रिप्शन कशी पाहावी?', 'अपॉइंटमेंट कशी बुक करावी?'];
      } else {
        replyText = `💊 **Essential Medicines Available Free at Government Health Centers**:\n\n• **Formulary**: Paracetamol 500mg, Amoxicillin 500mg, Metformin 500mg, ORS Packets, Iron & Folic Acid (IFA), Cetirizine, and Antacids are distributed **free of charge** at all public PHCs and CHCs.\n• **Safety Tip**: Complete your full antibiotic course as prescribed by the medical officer. Always take tablets after meals with drinking water.`;
        suggestedQuestions = ['Where is the nearest PHC?', 'View my Active Prescriptions', 'How to book an OPD appointment?'];
      }
    }

    // Queue Tracking & Live Token
    else if (
      lowerMsg.includes('queue') ||
      lowerMsg.includes('live queue') ||
      lowerMsg.includes('token') ||
      lowerMsg.includes('wait') ||
      lowerMsg.includes('कतार') ||
      lowerMsg.includes('रांग') ||
      lowerMsg.includes('नंबर')
    ) {
      if (lang === 'hi') {
        replyText = `⏱️ **लाइव ओपीडी कतार ट्रैकर (Live Queue Tracker)**:\n\n• **रीयल-टाइम प्रसारण**: आप 'Live Queue Tracker' पेज पर जाकर अपने अस्पताल की ओपीडी में वर्तमान में चल रहे टोकन नंबर और आगे कितने मरीज हैं, सीधे देख सकते हैं।\n• **अस्पताल बदलें**: आप ड्रॉपडाउन से अस्पताल बदलकर सतारा जिला अस्पताल, शिरवल PHC या मंगल मूर्ति अस्पताल की लाइव कतार देख सकते हैं।`;
        suggestedQuestions = ['लाइव कतार ट्रैकर खोलें', 'ओपीडी अपॉइंटमेंट कैसे बुक करें?', 'निकटतम अस्पताल कहाँ है?'];
      } else if (lang === 'mr') {
        replyText = `⏱️ **थेट ओपीडी रांग ट्रॅकर (Live Queue Tracker)**:\n\n• **थेट माहिती**: 'Live Queue Tracker' पृष्ठावर जाऊन तुम्ही सध्या चालू असलेला टोकन नंबर व तुमच्या पुढे किती रुग्ण आहेत हे रिअल-टाइममध्ये पाहू शकता.\n• **रुग्णालय बदला**: ड्रॉपडाउनमधून तुम्ही शिरवळ PHC किंवा सातारा जिल्हा रुग्णालयाची थेट रांग तपासू शकता.`;
        suggestedQuestions = ['थेट रांग ट्रॅकर उघडा', 'अपॉइंटमेंट कशी बुक करावी?', 'जवळचे रुग्णालय कुठे आहे?'];
      } else {
        replyText = `⏱️ **Live OPD Queue Tracker System**:\n\n• **Real-Time Broadcasts**: The **Live Queue Tracker** shows the token number currently being served in the OPD consultation room and how many patients are ahead of you.\n• **Change Facility**: Use the facility switcher at the top of the tracker to monitor queues across Mangal Murti Hospital, Shirwal PHC, or Satara District General Hospital.`;
        suggestedQuestions = ['Open Live Queue Tracker', 'How to book an appointment?', 'Where is the nearest PHC?'];
      }
    }

    // Teleconsultation & Video Call
    else if (
      lowerMsg.includes('teleconsult') ||
      lowerMsg.includes('video') ||
      lowerMsg.includes('call') ||
      lowerMsg.includes('doctor call') ||
      lowerMsg.includes('व्हिडिओ') ||
      lowerMsg.includes('कॉल')
    ) {
      if (lang === 'hi') {
        replyText = `📹 **वेबआरटीसी टेलीकंसल्टेशन (WebRTC Teleconsultation)**:\n\n• **ऑनलाइन डॉक्टर परामर्श**: आप 'WebRTC Teleconsult' टैब से सीधे विशेषज्ञ डॉक्टरों से वीडियो कॉल पर परामर्श ले सकते हैं।\n• **कैमरा व माइक अनुमति**: कॉल शुरू करते समय ब्राउज़र में कैमरा और माइक्रोफ़ोन की अनुमति (Allow) अवश्य दें।`;
        suggestedQuestions = ['टेलीकंसल्टेशन शुरू करें', 'ओपीडी अपॉइंटमेंट कैसे बुक करें?', 'डिजिटल स्वास्थ्य रिकॉर्ड कैसे देखें?'];
      } else if (lang === 'mr') {
        replyText = `📹 **व्हिडिओ टेलीकन्सल्टेशन (WebRTC Teleconsult)**:\n\n• **थेट डॉक्टर सल्ला**: तुम्ही 'WebRTC Teleconsult' विभागात जाऊन तज्ज्ञ डॉक्टरांशी घरबसल्या सुरक्षित व्हिडिओ कॉलद्वारे तपासणी करू शकता.\n• **कॅमेरा परमिशन**: कॉल सुरू करताना ब्राउझरमध्ये कॅमेरा व माइकची परवानगी (Allow) द्या.`;
        suggestedQuestions = ['टेलीकन्सल्टेशन सुरू करा', 'अपॉइंटमेंट कशी बुक करावी?', 'आरोग्य अहवाल कसा पाहावा?'];
      } else {
        replyText = `📹 **WebRTC Live Teleconsultation**:\n\n• **Remote Doctor Consultation**: Connect directly with medical officers and specialists via encrypted WebRTC audio/video consultations from the **WebRTC Teleconsult** tab.\n• **Device Permissions**: Ensure you grant camera and microphone permissions when prompted by your browser.`;
        suggestedQuestions = ['Launch Teleconsultation', 'How to book an appointment?', 'View my Medical Records'];
      }
    }

    // Default Empathetic Guidance
    else {
      if (lang === 'hi') {
        replyText = `नमस्ते! मैं **स्वास्थ्य एआई स्वास्थ्य सहायक (SWASTH AI)** हूँ।\n\nमैं आपकी निम्नलिखित सेवाओं में पूरी सहायता कर सकता हूँ:\n\n• 🏥 **निकटतम PHC, CHC और जिला अस्पताल खोजना**\n• 📅 **ओपीडी अपॉइंटमेंट और लाइव टोकन बुकिंग**\n• ⏱️ **लाइव कतार (Queue) स्थिति और प्रतीक्षा समय**\n• 💊 **सरकारी निःशुल्क दवाओं की जानकारी**\n• 🌡️ **बुखार, सर्दी, बीपी, शुगर और प्राथमिक उपचार मार्गदर्शन**\n• 📑 **डिजिटल स्वास्थ्य रिकॉर्ड और रेफरल सहायता**\n\nकृपया अपना प्रश्न या लक्षण बताएं!`;
        suggestedQuestions = ['निकटतम स्वास्थ्य केंद्र कहाँ है?', 'ओपीडी अपॉइंटमेंट कैसे बुक करें?', 'बुखार और सर्दी में क्या करें?', 'दवा उपलब्धता जांचें'];
      } else if (lang === 'mr') {
        replyText = `नमस्कार! मी **स्वास्थ एआय आरोग्य सहाय्यक (SWASTH AI)** आहे.\n\nमी तुम्हाला पुढील सर्व आरोग्य सेवांमध्ये मदत करू शकेन:\n\n• 🏥 **जवळचे प्राथमिक आरोग्य केंद्र (PHC) व रुग्णालय शोधणे**\n• 📅 **ओपीडी टोकन व अपॉइंटमेंट बुकिंग**\n• ⏱️ **थेट रांग (Live Queue) ट्रॅकिंग व प्रतीक्षा वेळ**\n• 💊 **शासकीय मोफत औषधांची माहिती**\n• 🌡️ **ताप, खोकला, बीपी, शुगर व प्रथमोपचार मार्गदर्शन**\n• 📑 **डिजिटल आरोग्य इतिहास व रेफरल ट्रॅकिंग**\n\nकृपया तुमचा प्रश्न किंवा लक्षणे येथे विचारा!`;
        suggestedQuestions = ['जवळचे आरोग्य केंद्र कुठे आहे?', 'अपॉइंटमेंट कशी बुक करावी?', 'ताप व सर्दीवर घरगुती उपाय काय?', 'मोफत औषध उपलब्धता'];
      } else {
        replyText = `Hello! I am **SWASTH AI Health Assistant**.\n\nI am your unified clinical guidance and navigation companion for Indian rural and public healthcare:\n\n• 🏥 **Find Nearest PHCs, CHCs, & District Hospitals** with driving routes\n• 📅 **Book OPD Consultation Tokens** in General Medicine, Pediatrics, MCH\n• ⏱️ **Track Real-time Live Queues** & estimated wait times\n• 💊 **Government Free Medicine Stock & Dosage Guidelines**\n• 🌡️ **Evidence-Based Guidance** for Fever, BP, Diabetes, Dehydration & First-Aid\n• 📑 **Access Longitudinal Health Records & ABHA Summaries**\n\nHow can I assist you with your healthcare needs today?`;
        suggestedQuestions = ['Where is the nearest PHC?', 'How to book an appointment?', 'Fever & cold home care guidelines', 'Check medicine availability'];
      }
    }

    const disclaimer =
      lang === 'hi'
        ? 'एआई सहायता केवल सूचनात्मक है और पेशेवर चिकित्सा देखभाल का विकल्प नहीं है।'
        : lang === 'mr'
        ? 'एआय मदत केवळ माहितीसाठी आहे आणि व्यावसायिक वैद्यकीय उपचारांचा पर्याय नाही.'
        : 'AI assistance is informational and does not replace professional medical care.';

    return {
      text: replyText,
      language: lang,
      disclaimer,
      isEmergency,
      suggestedQuestions,
    };
  }

  // 2. AI-Assisted Digital Triage (For Health Workers)
  async processDigitalTriage({ symptoms = [], vitals = {}, history = '', language = 'en' }) {
    const sysBp = parseInt((vitals.bp || '120/80').split('/')[0], 10);
    const temp = parseFloat(vitals.temp || 98.6);
    const spo2 = parseInt(vitals.spo2 || 98, 10);

    let urgency = 'LOW';
    const observations = [];
    const warningSigns = [];
    const recommendedAction = [];

    if (spo2 < 90 || sysBp > 160 || temp > 103) {
      urgency = 'CRITICAL';
      warningSigns.push('Severe SpO2 drop or extreme hypertensive/febrile state');
      recommendedAction.push('Immediate emergency stabilization and urgent higher-centre referral (District Hospital ICU)');
    } else if (spo2 < 95 || sysBp > 140 || temp > 101) {
      urgency = 'HIGH';
      warningSigns.push('Elevated vitals requiring immediate medical officer evaluation');
      recommendedAction.push('Schedule priority physician consultation and initiate continuous vital monitoring');
    } else if (temp > 99.5 || sysBp > 130) {
      urgency = 'MEDIUM';
      observations.push('Mildly elevated temperature or pre-hypertension vitals');
      recommendedAction.push('General OPD consultation, hydration advice, and symptom check in 48 hours');
    } else {
      urgency = 'LOW';
      observations.push('Vitals are within normal clinical thresholds');
      recommendedAction.push('Standard outpatient consultation and routine care');
    }

    const multilangLabels = {
      en: { disclaimer: "AI-assisted information — not a diagnosis." },
      hi: { disclaimer: "एआई-सहायता प्राप्त जानकारी — कोई निदान नहीं।" },
      mr: { disclaimer: "एआय-सहाय्यित माहिती — हे निदान नाही." }
    };

    return {
      urgency,
      observations: observations.length > 0 ? observations : ['Patient symptoms recorded for clinical evaluation.'],
      possibleConsiderations: ['Acute Febrile Illness', 'Upper Respiratory Tract Infection', 'Hypertension Risk'],
      warningSigns,
      recommendedNextAction: recommendedAction.join('; '),
      missingInformation: !vitals.spo2 ? ['Pulse Oximetry (SpO2) reading'] : [],
      disclaimer: (multilangLabels[language] || multilangLabels.en).disclaimer
    };
  }

  // 3. AI Record Summarization
  async processRecordSummary({ encounters = [], patientName = 'Patient', language = 'en' }) {
    const summaryText = `Clinical History Summary for ${patientName}:
    Total recorded encounters: ${encounters.length}.
    Key documented observations indicate stable vitals, active health worker surveillance, and good adherence.
    Active medications: Paracetamol 500mg, Multivitamin & Zinc.
    All diagnostic parameters remain under active health worker monitoring.`;

    return {
      summary: summaryText,
      keyObservations: ['Regular OPD attendee', 'Good medication adherence', 'Routine vitals stable'],
      disclaimer: 'AI-generated clinical summary. Please review before appending to official health records.'
    };
  }

  // 4. AI Referral Summary
  async processReferralSummary({ patientName, reason, vitals, language = 'en' }) {
    return {
      summary: `Referral Recommendation for ${patientName}: Patient requires advanced evaluation for ${reason}. Current vitals: BP ${vitals?.bp || '120/80'}, Pulse ${vitals?.pulse || 78} bpm. Higher-centre specialty consult (District Hospital) is advised.`,
      suggestedUrgency: vitals?.spo2 < 92 ? 'URGENT' : 'ROUTINE'
    };
  }

  // 5. AI-Assisted Risk Detection & Early Warning
  async processRiskAssessment({ patientProfile, encounters = [], vitals = {}, missedFollowupsCount = 0 }) {
    const age = patientProfile?.dateOfBirth ? (new Date().getFullYear() - new Date(patientProfile.dateOfBirth).getFullYear()) : 45;
    const sysBp = parseInt((vitals.bp || '120/80').split('/')[0], 10);
    const spo2 = parseInt(vitals.spo2 || 98, 10);

    let riskLevel = 'LOW';
    const riskFactors = [];
    const warningSignals = [];
    let followUpPriority = 'ROUTINE';
    let recommendedAction = 'Continue routine health surveillance at local PHC.';

    if (age > 60) riskFactors.push('Geriatric age group (> 60 yrs)');
    if (sysBp >= 140) riskFactors.push(`Elevated Systolic BP (${sysBp} mmHg)`);
    if (spo2 <= 94) riskFactors.push(`Sub-optimal Oxygen Saturation (${spo2}%)`);
    if (missedFollowupsCount > 0) riskFactors.push(`Missed ${missedFollowupsCount} scheduled follow-up appointments`);

    if (spo2 < 92 || sysBp >= 160 || missedFollowupsCount >= 2) {
      riskLevel = 'CRITICAL';
      warningSignals.push('High cardiovascular/respiratory compromise or severe care discontinuity');
      followUpPriority = 'URGENT';
      recommendedAction = 'Immediate specialist evaluation at District Hospital and urgent ANM home visit.';
    } else if (riskFactors.length >= 2 || sysBp >= 140) {
      riskLevel = 'HIGH';
      warningSignals.push('Multiple moderate clinical and compliance risk factors detected');
      followUpPriority = 'PRIORITY';
      recommendedAction = 'Schedule priority physician follow-up within 7 days and conduct remote vitals check.';
    } else if (riskFactors.length === 1) {
      riskLevel = 'MEDIUM';
      followUpPriority = 'PRIORITY';
      recommendedAction = 'Re-evaluate vitals in 14 days at PHC OPD.';
    }

    return {
      aiRiskLevel: riskLevel,
      riskFactors: riskFactors.length > 0 ? riskFactors : ['No major clinical risk factors identified'],
      warningSignals,
      recommendedAction,
      followUpPriority,
      aiConfidence: 0.91,
      disclaimer: 'AI-assisted assessment requiring professional review.'
    };
  }
}

module.exports = MockAIProvider;

