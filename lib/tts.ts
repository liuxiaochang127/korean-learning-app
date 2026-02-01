// tts.ts - Text to Speech Utility
// Optimized for Android WebView, WeChat, and iOS with Online Fallback

let voicesLoaded = false;
let cachedVoices: SpeechSynthesisVoice[] = [];

// Preload voices to handle Android async loading
const loadVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
    if (cachedVoices.length > 0) {
      voicesLoaded = true;
    }
  }
};

// Listener for async voice loading (critical for Chrome/Android)
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    loadVoices();
  };
  loadVoices(); // Initial try
}

// Fallback TTS using Online API (Youdao - Reliable in China)
const playOnlineTTS = (text: string) => {
  // Cancel any browser synthesis
  window.speechSynthesis.cancel();

  const encodedText = encodeURIComponent(text);
  // Youdao Dict Voice API: le=ko for Korean
  const url = `https://dict.youdao.com/dictvoice?audio=${encodedText}&le=ko`;

  const audio = new Audio(url);
  audio.onerror = (e) => {
    console.error("Online TTS Failed:", e);
    alert("无法播放语音，请检查网络连接");
  };

  // WeChat Audio Hack: sometimes requires interaction handling or WeixinJSBridge
  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.error("Audio play failed:", error);
      // Auto-play policy error often happens here
    });
  }
};

export const speakKorean = (text: string) => {
  if (!text) return;

  // Strategy 1: Browser Speech Synthesis (Preferred if available & Korean voice exists)
  if ('speechSynthesis' in window) {
    // Ensure voice list is fresh
    if (!voicesLoaded || cachedVoices.length === 0) {
      cachedVoices = window.speechSynthesis.getVoices();
    }

    // Check if we have a legitimate Korean voice
    // (Many Androids in China lack Korean TTS engine, returning 0 voices or only English/Chinese)
    const koreanVoice = cachedVoices.find(v => v.lang === 'ko-KR' || v.lang === 'ko_KR');
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent);

    // On Android WeChat, local TTS is notoriously broken or missing. 
    // If we don't have a confirmed Korean voice, OR if it's WeChat (often silent), force fallback to online.
    // We only use local if we explicitely found a Korean voice AND it's not WeChat (to be safe), 
    // OR if user explicitly wants local (hard to know).
    // Let's try: If (Korean Voice Exists AND (Not WeChat OR iOS)), use Local. Else Online.
    // Actually, iOS WeChat works fine with system voices. Android WeChat is the trouble.

    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (koreanVoice && (isIOS || !isWeChat)) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.voice = koreanVoice;
      utterance.rate = 0.9;

      utterance.onerror = (e) => {
        console.warn("Local TTS error, switching to online fallback", e);
        playOnlineTTS(text);
      };

      window.speechSynthesis.speak(utterance);
      return;
    }
  }

  // Strategy 2: Online Fallback (Youdao)
  // This is the default for Android WeChat or missing Engines
  playOnlineTTS(text);
};
