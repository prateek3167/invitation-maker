/**
 * AI Wedding Invitation Content & Shloka Assistant
 * Generates culturally authentic, poetic, and personalized Indian wedding copy.
 */

export interface InvitationPromptOptions {
  ceremony: 'vivah' | 'haldi' | 'mehndi' | 'sangeet' | 'reception' | 'sagaai';
  tone: 'royal' | 'traditional' | 'romantic' | 'playful' | 'formal';
  voice: 'bride_parents' | 'groom_parents' | 'couple' | 'friends';
  language: 'hindi' | 'english' | 'hinglish';
  brideName: string;
  groomName: string;
  familySurname?: string;
}

export interface GeneratedInvitationCopy {
  id: string;
  heading: string;
  title: string;
  subtitle: string;
  message: string;
  rhymeOrQuote: string;
  hashtag: string;
  recommendedFont: string;
}

/**
 * Intelligent generator producing culturally resonant, poetic Indian wedding phrasing.
 */
export function generateInvitationCopy(options: InvitationPromptOptions): GeneratedInvitationCopy[] {
  const { ceremony, tone, voice, language, brideName, groomName, familySurname = 'Sharma' } = options;

  const b = brideName || 'Aarushi';
  const g = groomName || 'Siddharth';
  const fam = familySurname || 'Parivar';

  const results: GeneratedInvitationCopy[] = [];

  // ==========================================
  // 1. PURE HINDI / DEVANAGARI GENERATIONS
  // ==========================================
  if (language === 'hindi') {
    if (ceremony === 'vivah') {
      if (tone === 'royal' || tone === 'traditional') {
        results.push({
          id: 'hi_vivah_royal_1',
          heading: '॥ श्री गणेशाय नमः ॥',
          title: `आयुष्मान ${g} संग आयुष्मती ${b}`,
          subtitle: 'परमपिता परमेश्वर के पावन आशीर्वाद से',
          message:
            voice === 'bride_parents'
              ? `हमारी प्रिय लाडली सुपुत्री ${b} के पावन परिणयोत्सव के शुभ अवसर पर आप सपरिवार सादर आमंत्रित हैं।`
              : voice === 'groom_parents'
              ? `हमारे प्रिय सुपुत्र ${g} के शुभ विवाह समारोह में आपकी गरिमामयी उपस्थिति सादर प्रार्थनीय है।`
              : `हमारे जीवन के इस नए सफर की शुरुआत में आपके स्नेह एवं पावन आशीर्वाद की आकांक्षा है।`,
          rhymeOrQuote: 'मङ्गलं भगवान् विष्णुर्मङ्गलं गरुडध्वजः। मङ्गलं पुण्डरीकाक्षो मङ्गलायतनो हरिः॥',
          hashtag: `#${b}Weds${g}`,
          recommendedFont: "'Rozha One', serif",
        });

        results.push({
          id: 'hi_vivah_royal_2',
          heading: '॥ शुभ विवाह ॥',
          title: `${b} एवं ${g}`,
          subtitle: 'दो कुलों का पावन मिलन एवं नया सवेरा',
          message: `ईश्वर की असीम अनुकंपा से आयोजित इस मांगलिक विवाह बेला में आपके पावन चरणों की उपस्थिति हमारे उत्सव की शोभा बढ़ाएगी।`,
          rhymeOrQuote: 'सखा सप्तपदा भव। सख्यं ते गमेयम्। सख्यात् ते मा योषम्।',
          hashtag: `#${g}Ki${b}`,
          recommendedFont: "'Tiro Devanagari Hindi', serif",
        });
      } else if (tone === 'romantic') {
        results.push({
          id: 'hi_vivah_romantic',
          heading: '॥ दो दिलों का पावन संगम ॥',
          title: `${b} और ${g}`,
          subtitle: 'सात जन्मों का अटूट बंधन',
          message: `जब दो दिल मिले और दो रूहें एक हुईं, उसी सुनहरे पल को जीने के लिए हम आपको सस्नेह आमंत्रित करते हैं।`,
          rhymeOrQuote: 'यदेतद् हृदयं तव तदस्तु हृदयं मम। यदिदं हृदयं मम तदस्तु हृदयं तव॥',
          hashtag: `#${b}Loves${g}`,
          recommendedFont: "'Kalam', cursive",
        });
      } else {
        results.push({
          id: 'hi_vivah_formal',
          heading: '॥ स्नेह निमंत्रण ॥',
          title: `${b} संग ${g}`,
          subtitle: 'पावन परिणयोत्सव',
          message: `${fam} परिवार की ओर से आपको इस वैवाहिक उत्सव में सादर आमंत्रित किया जाता है। आपकी उपस्थिति हमारे लिए गौरव का विषय होगी।`,
          rhymeOrQuote: 'दर्शनाभिलाषी: समस्त परिवारजन एवं मित्रगण',
          hashtag: `#${b}${g}Vivah`,
          recommendedFont: "'Noto Serif Devanagari', serif",
        });
      }
    } else if (ceremony === 'haldi') {
      results.push({
        id: 'hi_haldi_1',
        heading: '॥ शुभ हल्दी उत्सव ॥',
        title: `रंग, हल्दी और प्यार`,
        subtitle: `${b} एवं ${g} की शादी की शुरुआत`,
        message: 'पीत वर्ण की आभा से सजेंगे वर-वधू, ढोलक की थाप पर थिरकेंगे कदम। आइए और हल्दी की खुशियों को दोगुना कीजिए।',
        rhymeOrQuote: 'हल्दी रचेगी, ढोल बजेगा, खुशियों से पूरा आंगन सजेगा!',
        hashtag: `#HaldiHai${b}Ki`,
        recommendedFont: "'Yatra One', cursive",
      });
    } else if (ceremony === 'mehndi') {
      results.push({
        id: 'hi_mehndi_1',
        heading: '॥ मेहँदी की रात ॥',
        title: `सजेगी मेहंदी, रचेगा प्यार`,
        subtitle: `${b} के हाथों में सजन का नाम`,
        message: 'हरी मेहंदी की खुशबू, ढोलक के सुरीले तराने और अपनों का संग। हमारी इस रंगारंग शाम में आपका हार्दिक स्वागत है।',
        rhymeOrQuote: 'मेहंदी है रचने वाली, हाथों में गहरी लाली, कहें सखियां अब सजन का प्यार मिला!',
        hashtag: `#${b}KiMehndi`,
        recommendedFont: "'Kalam', cursive",
      });
    } else if (ceremony === 'sangeet') {
      results.push({
        id: 'hi_sangeet_1',
        heading: '॥ संगीत संध्या एवं सुर-ताल ॥',
        title: `गीत, संगीत और जश्न की रात`,
        subtitle: `${b} और ${g} का संगीतमय उत्सव`,
        message: 'सुरों की महफ़िल, थिरकते कदम और खुशियों की बौछार। शादी से पहले की इस मस्ती भरी शाम में आप सादर आमंत्रित हैं।',
        rhymeOrQuote: 'नाचेंगे, गाएंगे, जश्न मनाएंगे, इस संगीत संध्या को यादगार बनाएंगे!',
        hashtag: `#${b}${g}SangeetBeats`,
        recommendedFont: "'Yatra One', cursive",
      });
    } else {
      results.push({
        id: 'hi_reception_1',
        heading: '॥ प्रीतिभोज एवं स्वागत समारोह ॥',
        title: `${b} एवं ${g}`,
        subtitle: 'नव-दंपति का स्नेह मिलन',
        message: 'विवाह उपरांत नव-दंपति को अपने शुभाशीर्वाद से अभिसिंचित करने हेतु आयोजित प्रीतिभोज में आप सपरिवार सादर आमंत्रित हैं।',
        rhymeOrQuote: 'विनीत: समस्त परिवारजन',
        hashtag: `#${b}${g}Reception`,
        recommendedFont: "'Noto Serif Devanagari', serif",
      });
    }
  }

  // ==========================================
  // 2. ELEGANT ENGLISH GENERATIONS
  // ==========================================
  else if (language === 'english') {
    if (ceremony === 'vivah') {
      if (tone === 'royal' || tone === 'formal') {
        results.push({
          id: 'en_vivah_royal_1',
          heading: '|| SHREE GANESHAYA NAMAHA ||',
          title: `${b} & ${g}`,
          subtitle: 'Request the pleasure of your company',
          message:
            voice === 'bride_parents'
              ? `Together with their family, the parents of ${b} cordially invite you to celebrate the holy matrimony with ${g}.`
              : voice === 'groom_parents'
              ? `The parents of ${g} request the honor of your presence at the wedding ceremony of their beloved son with ${b}.`
              : `Together with our families, we joyfully invite you to share in our celebration of love and lifelong commitment.`,
          rhymeOrQuote: 'Two souls, one sacred journey blessed by eternity.',
          hashtag: `#${b}TiesTheKnotWith${g}`,
          recommendedFont: "'Cinzel', serif",
        });

        results.push({
          id: 'en_vivah_royal_2',
          heading: 'A ROYAL CELEBRATION OF LOVE',
          title: `${b} & ${g}`,
          subtitle: 'The Auspicious Wedding Ceremony',
          message: `Under the canopy of stars and in the warmth of loved ones, join us as we embark upon the sacred seven vows of marriage.`,
          rhymeOrQuote: 'May your presence and blessings grace our most cherished day.',
          hashtag: `#Forever${b}And${g}`,
          recommendedFont: "'Playfair Display', serif",
        });
      } else if (tone === 'romantic') {
        results.push({
          id: 'en_vivah_romantic',
          heading: 'WE DECIDED ON FOREVER',
          title: `${b} & ${g}`,
          subtitle: 'Our Wedding Day',
          message: `Once in a while, right in the middle of an ordinary life, love gives us a fairytale. We invite you to be part of ours.`,
          rhymeOrQuote: 'Hand in hand, heart to heart, from this day forward.',
          hashtag: `#${b}FoundHer${g}`,
          recommendedFont: "'Great Vibes', cursive",
        });
      } else {
        results.push({
          id: 'en_vivah_playful',
          heading: 'SAVE THE DATE FOR THE BIG DAY',
          title: `${b} & ${g}`,
          subtitle: 'Are Getting Married!',
          message: `Good food, great music, endless dancing, and two best friends making it official. Come celebrate with us!`,
          rhymeOrQuote: 'Drinks, dinner, and dancing under the stars to follow.',
          hashtag: `#${b}And${g}BigFatShaadi`,
          recommendedFont: "'Playfair Display', serif",
        });
      }
    } else if (ceremony === 'haldi') {
      results.push({
        id: 'en_haldi_1',
        heading: 'THE SHUBH HALDI CEREMONY',
        title: 'Turmeric, Marigolds & Sunshine',
        subtitle: `Blessings & Laughter for ${b} & ${g}`,
        message: `Get ready to drench us in yellow hues! Join us for a joyous morning filled with dhol beats, auspicious turmeric, and sweet memories.`,
        rhymeOrQuote: 'A touch of gold to bless the couple with good health and prosperous beginnings.',
        hashtag: `#YellowVibes${b}`,
        recommendedFont: "'Playfair Display', serif",
      });
    } else if (ceremony === 'mehndi') {
      results.push({
        id: 'en_mehndi_1',
        heading: 'THE MEHNDI CELEBRATION',
        title: 'Henna, Swirls & Celebrations',
        subtitle: `An Evening of Music & Intricate Art`,
        message: `Fragrant henna, lively folk tunes, and colorful swirls! We invite you to join us as the bride adorns her hands with love and laughter.`,
        rhymeOrQuote: 'As deep as the henna leaves its hue, so may our love forever bloom true.',
        hashtag: `#MehndiMagic${b}`,
        recommendedFont: "'Great Vibes', cursive",
      });
    } else if (ceremony === 'sangeet') {
      results.push({
        id: 'en_sangeet_1',
        heading: 'SANGEET & DANCE NIGHT',
        title: 'Beats, Glamour & Celebration',
        subtitle: `Get Ready to Burn the Dance Floor!`,
        message: `High-voltage family dance face-offs, pulsating beats, and endless cocktails! Join us for the most electrifying night of the wedding.`,
        rhymeOrQuote: 'Put on your dancing shoes and celebrate the rhythm of togetherness.',
        hashtag: `#${b}${g}DanceParty`,
        recommendedFont: "'Cinzel', serif",
      });
    } else {
      results.push({
        id: 'en_reception_1',
        heading: 'THE GRAND WEDDING RECEPTION',
        title: `${b} & ${g}`,
        subtitle: 'An Evening of Dinner & Elegance',
        message: `Please join us for a grand gala dinner and toast to celebrate the newlyweds as they begin their married life together.`,
        rhymeOrQuote: 'Dinner, Cocktails, Music & Merriment to follow.',
        hashtag: `#The${g}Reception`,
        recommendedFont: "'Playfair Display', serif",
      });
    }
  }

  // ==========================================
  // 3. HINGLISH GENERATIONS
  // ==========================================
  else {
    results.push({
      id: 'hinglish_1',
      heading: '॥ SHREE GANESHAYA NAMAHA ॥',
      title: `${b} Weds ${g}`,
      subtitle: 'The Big Fat Indian Wedding Celebration',
      message: `Pyar, parivar aur dhol-nagadon ke sath! Join us as ${b} & ${g} take their saat pheras and start their forever journey together.`,
      rhymeOrQuote: 'Hasi, khushiyan aur dher sara naach gaana!',
      hashtag: `#${b}${g}KiShaadi`,
      recommendedFont: "'Rozha One', serif",
    });
  }

  return results;
}
