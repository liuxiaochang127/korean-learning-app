export const speakKorean = (text: string) => {
  if (!('speechSynthesis' in window)) {
    alert("您的浏览器不支持语音播放功能");
    return;
  }

  // 停止当前正在播放的语音
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.8; // 0.8倍速，适合学习
  utterance.pitch = 1;

  // 尝试获取最佳的韩语语音包 (iOS/Mac通常有很好的系统语音)
  const voices = window.speechSynthesis.getVoices();
  // 优先匹配 Google 或者 Apple 的韩语语音
  const koreanVoice = voices.find(v =>
    (v.lang === 'ko-KR' || v.lang === 'ko_KR') && !v.localService
  ) || voices.find(v => v.lang === 'ko-KR' || v.lang === 'ko_KR');

  if (koreanVoice) {
    utterance.voice = koreanVoice;
  }

  window.speechSynthesis.speak(utterance);
};
