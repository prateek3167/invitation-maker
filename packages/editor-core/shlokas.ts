/**
 * Vedic Shlokas & Traditional Hindi/Devanagari Wedding Phrasing Library
 * Authentic Sanskrit verses with meanings and 1-click Devanagari invitation presets.
 */

import type { Invitation } from './document';
import type { CanvasElement } from './canvas';

export interface VedicShloka {
  id: string;
  category: 'ganesh' | 'vivah' | 'gauri' | 'saptapadi' | 'shanti' | 'headlines' | 'traditional_lines';
  title: string;
  hindiTitle: string;
  sanskrit: string;
  meaning: string;
  suggestedFont: string;
  suggestedFontSize: number;
}

export const VEDIC_SHLOKAS: VedicShloka[] = [
  // 1. Ganesh Invocations
  {
    id: 'ganesh_vakratunda',
    category: 'ganesh',
    title: 'Ganesh Vandana (Vakratunda)',
    hindiTitle: '॥ वक्रतुण्ड महाकाय (गणेश वंदना) ॥',
    sanskrit: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥',
    meaning: 'हे विशाल शरीर, करोड़ों सूर्यों के समान तेजस्वी गणेश जी, हमारे सभी मांगलिक कार्यों को सदैव विघ्न-रहित पूर्ण करें।',
    suggestedFont: "'Tiro Devanagari Hindi', serif",
    suggestedFontSize: 16,
  },
  {
    id: 'ganesh_invocation',
    category: 'ganesh',
    title: 'Shree Ganeshaya Namaha',
    hindiTitle: '॥ श्री गणेशाय नमः ॥',
    sanskrit: '॥ श्री गणेशाय नमः ॥',
    meaning: 'सर्वप्रथम भगवान श्री गणेश को सादर वंदन एवं नमन।',
    suggestedFont: "'Rozha One', serif",
    suggestedFontSize: 24,
  },
  {
    id: 'kuldevata_invocation',
    category: 'ganesh',
    title: 'Kuldevata & Radheshyam Invocation',
    hindiTitle: '॥ श्री कुलदेवतायै नमः ॥',
    sanskrit: '॥ श्री कुलदेवतायै नमः ॥\n॥ ॐ श्री राधेश्यामाय नमः ॥',
    meaning: 'परम पूज्य कुलदेवी-देवता एवं युगल सरकार श्री राधेश्याम का पावन आशीर्वाद।',
    suggestedFont: "'Rozha One', serif",
    suggestedFontSize: 18,
  },

  // 2. Vivah Mangalam
  {
    id: 'vivah_mangalam',
    category: 'vivah',
    title: 'Mangalam Bhagwan Vishnu',
    hindiTitle: '॥ मङ्गलं भगवान् विष्णुः (विवाह मंगल) ॥',
    sanskrit: 'मङ्गलं भगवान् विष्णुर्मङ्गलं गरुडध्वजः।\nमङ्गलं पुण्डरीकाक्षो मङ्गलायतनो हरिः॥',
    meaning: 'श्री हरि विष्णु मंगलकारी हैं, गरुड़ध्वज मंगलमय हैं, कमल नयन प्रभु समस्त मंगलों के धाम हैं।',
    suggestedFont: "'Tiro Devanagari Hindi', serif",
    suggestedFontSize: 16,
  },
  {
    id: 'vivah_sambandham',
    category: 'vivah',
    title: 'Yathedam Hridayam Tava',
    hindiTitle: '॥ यदेतद् हृदयं तव (हृदय मिलन) ॥',
    sanskrit: 'यदेतद् हृदयं तव तदस्तु हृदयं मम।\nयदिदं हृदयं मम तदस्तु हृदयं तव॥',
    meaning: 'जो तुम्हारा हृदय है, वही मेरा हृदय हो; और जो मेरा हृदय है, वही तुम्हारा हृदय बने।',
    suggestedFont: "'Tiro Devanagari Hindi', serif",
    suggestedFontSize: 16,
  },

  // 3. Gauri & Shakti Vandana
  {
    id: 'gauri_sarva_mangala',
    category: 'gauri',
    title: 'Sarva Mangala Mangalye',
    hindiTitle: '॥ सर्वमङ्गलमाङ्गल्ये (मां गौरी वंदना) ॥',
    sanskrit: 'सर्वमङ्गलमाङ्गल्ये शिवे सर्वार्थसाधिके।\nशरण्ये त्र्यम्बके गौरि नारायणि नमोऽस्तु ते॥',
    meaning: 'सभी मंगलों की मंगल, कल्याणकारिणी, समस्त मनोरथ पूर्ण करने वाली शरणागतवत्सला मां गौरी को नमन।',
    suggestedFont: "'Tiro Devanagari Hindi', serif",
    suggestedFontSize: 16,
  },

  // 4. Saptapadi / Saat Phere
  {
    id: 'saptapadi_sakha',
    category: 'saptapadi',
    title: 'Saptapadi (Seven Sacred Vows)',
    hindiTitle: '॥ सखा सप्तपदा भव (सप्तपदी) ॥',
    sanskrit: 'सखा सप्तपदा भव। सख्यं ते गमेयम्।\nसख्यात् ते मा योषम्। सख्यान्मे मा योष्ठाः॥',
    meaning: 'सात कदमों के साथ हम अभिन्न मित्र और जीवन-साथी बने। हमारा यह अटूट स्नेह जन्म-जन्मांतर तक प्रगाढ़ रहे।',
    suggestedFont: "'Tiro Devanagari Hindi', serif",
    suggestedFontSize: 15,
  },

  // 5. Vedic Ashirwad & Shanti Path
  {
    id: 'shanti_path',
    category: 'shanti',
    title: 'Vedic Shanti Mantra',
    hindiTitle: '॥ ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः ॥',
    sanskrit: 'ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः।\nशान्तिरेव शान्तिः सा मा शान्तिरेधि॥',
    meaning: 'द्युलोक में शांति हो, अंतरिक्ष में शांति हो, पृथ्वी, जल, औषधियां एवं संपूर्ण ब्रह्मांड में शांति व्याप्त हो।',
    suggestedFont: "'Tiro Devanagari Hindi', serif",
    suggestedFontSize: 14,
  },

  // 6. Auspicious Ceremony Headlines
  {
    id: 'heading_shubh_vivah',
    category: 'headlines',
    title: 'Shubh Vivah Ceremony',
    hindiTitle: '॥ शुभ विवाह ॥',
    sanskrit: '॥ शुभ विवाह ॥',
    meaning: 'पावन परिणयोत्सव',
    suggestedFont: "'Rozha One', serif",
    suggestedFontSize: 34,
  },
  {
    id: 'heading_haldi_utsav',
    category: 'headlines',
    title: 'Shubh Haldi Utsav',
    hindiTitle: '॥ शुभ हल्दी उत्सव ॥',
    sanskrit: '॥ शुभ हल्दी उत्सव ॥\nरंग, हल्दी और ढोलक के संग',
    meaning: 'हल्दी रस्म एवं मांगलिक उल्लास',
    suggestedFont: "'Yatra One', cursive",
    suggestedFontSize: 24,
  },
  {
    id: 'heading_mehndi_raat',
    category: 'headlines',
    title: 'Shubh Mehndi Ki Raat',
    hindiTitle: '॥ मेहँदी की रात ॥',
    sanskrit: '॥ मेहँदी की रात ॥\nसजेगी मेहंदी, रचेगा प्यार',
    meaning: 'पारंपरिक मेहंदी समारोह',
    suggestedFont: "'Kalam', cursive",
    suggestedFontSize: 26,
  },
  {
    id: 'heading_sangeet_sandhya',
    category: 'headlines',
    title: 'Sangeet Sandhya & Sur-Taal',
    hindiTitle: '॥ संगीत संध्या एवं सुर-ताल ॥',
    sanskrit: '॥ संगीत संध्या एवं सुर-ताल ॥\nगीत, संगीत और खुशियों की महफ़िल',
    meaning: 'पारिवारिक संगीत एवं नृत्य उत्सव',
    suggestedFont: "'Yatra One', cursive",
    suggestedFontSize: 24,
  },

  // 7. Traditional Hindi Formal Invitation Lines
  {
    id: 'traditional_invitation_line',
    category: 'traditional_lines',
    title: 'Sneha Nimantran (Family Invite)',
    hindiTitle: 'स्नेह निमंत्रण (पारिवारिक आमंत्रण)',
    sanskrit: 'परमपिता परमेश्वर की असीम अनुकंपा से हमारे प्रिय सुपुत्र / सुपुत्री के वैवाहिक समारोह में आप सपरिवार सादर आमंत्रित हैं।',
    meaning: 'औपचारिक व पारंपरिक हिंदी आमंत्रण संदेश।',
    suggestedFont: "'Noto Serif Devanagari', serif",
    suggestedFontSize: 15,
  },
  {
    id: 'darshanabhilashi_line',
    category: 'traditional_lines',
    title: 'Darshanabhilashi & Swagatakankshi',
    hindiTitle: 'दर्शनाभिलाषी एवं विनीत',
    sanskrit: 'दर्शनाभिलाषी: समस्त परिवारजन एवं इष्ट-मित्र\nविनीत: [परिवार का नाम]\nस्वागत: नन्हे-मुन्ने बाल गोपाल',
    meaning: 'पारंपरिक भारतीय शादी कार्ड की स्वागत एवं विनीत पंक्तियां।',
    suggestedFont: "'Noto Serif Devanagari', serif",
    suggestedFontSize: 13,
  },
];

/**
 * Transforms an English/Standard invitation document into an authentic Shudh Hindi Devanagari invitation preset.
 */
export function convertDocumentToHindi(doc: Invitation): {
  fields: Invitation['fields'];
  font: Invitation['font'];
} {
  const brideName = doc.fields.host || 'आरुषी';
  const groomName = doc.fields.partner || 'सिद्धार्थ';

  return {
    fields: {
      ...doc.fields,
      heading: '॥ श्री गणेशाय नमः ॥',
      host: brideName,
      partner: groomName,
      message:
        doc.fields.message?.length > 10
          ? 'हमारे प्रिय सुपुत्र / सुपुत्री के पावन परिणयोत्सव के शुभ अवसर पर आप सपरिवार सादर आमंत्रित हैं।'
          : 'के पावन परिणयोत्सव में आपकी गरिमामयी उपस्थिति सादर प्रार्थनीय है।',
      date: 'शनिवार, २८ नवंबर २०२६',
      time: 'सायं ७:०० बजे से प्रभु इच्छा तक',
      venue: 'शाही राजमहल पैलेस, मुख्य मार्ग, नई दिल्ली',
    },
    font: 'serif',
  };
}

/**
 * Updates text canvas elements to matching Devanagari Google Fonts.
 */
export function applyDevanagariFontsToElements(
  elements: CanvasElement[],
  primaryFont: string = "'Rozha One', serif",
  bodyFont: string = "'Noto Serif Devanagari', serif"
): CanvasElement[] {
  return elements.map(el => {
    if (el.type !== 'text') return el;
    // Headings, titles, invocations get royal Rozha One or Yatra One
    if (
      el.name.toLowerCase().includes('heading') ||
      el.name.toLowerCase().includes('couple') ||
      el.name.toLowerCase().includes('invocation') ||
      (el.fontSize && el.fontSize >= 24)
    ) {
      return {
        ...el,
        fontFamily: primaryFont,
      };
    }
    // Subheadings, dates, venues, body details get elegant Noto Serif Devanagari
    return {
      ...el,
      fontFamily: bodyFont,
    };
  });
}
