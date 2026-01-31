// tts.ts - Text to Speech Utility
// Optimized for Android WebView, WeChat, and iOS

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

export const speakKorean = (text: string) => {
  if (!('speechSynthesis' in window)) {
    console.error("Browser does not support speech synthesis");
    alert("您的浏览器不支持语音播放建议使用 Chrome 或 Safari 打开");
    return;
  }

  // Always cancel previous utterance
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.9; // Slightly faster but clear
  utterance.pitch = 1.0;

  // Retry fetching voices if empty (Android cold start)
  if (!voicesLoaded || cachedVoices.length === 0) {
    cachedVoices = window.speechSynthesis.getVoices();
  }

  // Voice Selection Strategy
  // 1. Exact Match for Korean (Google/System)
  // 2. Fallback to any 'ko' code
  let koreanVoice = cachedVoices.find(v => v.lang === 'ko-KR' || v.lang === 'ko_KR');

  // Android/WeChat specific: explicit check for 'Google' voices which are usually higher quality
  // "Google Korean" is common on Android
  const googleVoice = cachedVoices.find(v => v.name.includes('Google') && v.lang.includes('ko'));
  if (googleVoice) {
    koreanVoice = googleVoice;
  }

  if (koreanVoice) {
    utterance.voice = koreanVoice;
    console.log("Using voice:", koreanVoice.name);
  } else {
    console.warn("No specific Korean voice found, relying on default lang 'ko-KR'");
  }

  // Android WeChat Workaround:
  // Sometimes 'speak' fails if not triggered by direct user interaction,
  // or if volume is handled weirdly. 
  // We add error logging.
  utterance.onerror = (e) => {
    console.error("TTS Error:", e);
    // Fallback for some Android WebViews that block 'speak' without user gesture context persistence
  };

  try {
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.error("Speech trigger failed:", e);
    alert("语音播放失败，请检查手机静音开关或权限");
  }
};
