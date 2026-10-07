import { GameOverReason, Language } from '../types/game';

export interface Translations {
  mainMenu: {
    play: string;
    levels: string;
    settings: string;
    levelsCount: (completed: number, total: number) => string;
    subtitle: string;
    rules: string;
  };
  header: {
    level: (id: number) => string;
    clearBoard: string;
    score: string;
    shots: string;
    pauseTooltip: string;
    restartTooltip: string;
    settingsTooltip: string;
    skipTooltip: string;
  };
  launcher: {
    next: string;
    shots: string;
    dragToAim: string;
    wheeee: string;
    swapTooltip: string;
  };
  pause: {
    title: string;
    levelScore: (id: number, score: number) => string;
    resume: string;
    restart: string;
    levels: string;
    mainMenu: string;
    sound: string;
    music: string;
    on: string;
    off: string;
  };
  gameOver: {
    title: string;
    subtitle: (id: number, reason?: GameOverReason) => string;
    reasonText: (reason?: GameOverReason) => string;
    fuzziesCleared: string;
    remainingOnBoard: string;
    left: string;
    currentScore: string;
    continueShots: string;
    skipLevel: (id: number) => string;
    replay: string;
    levels: string;
  };
  levelComplete: {
    title: string;
    fantastic: string;
    score: string;
    highScore: string;
    newRecord: string;
    nextLevel: string;
    replay: string;
    levels: string;
  };
  settings: {
    title: string;
    audio: string;
    soundEffects: string;
    soundEffectsDesc: string;
    music: string;
    musicDesc: string;
    gameplay: string;
    aimAssist: string;
    aimAssistDesc: string;
    language: string;
    languageDesc: string;
    turkish: string;
    english: string;
    dangerZone: string;
    resetDesc: string;
    resetButton: string;
    confirmReset: string;
    close: string;
  };
  levelSelect: {
    title: string;
    starsCount: (stars: number) => string;
    back: string;
    locked: string;
  };
  inGameText: {
    drop: string;
    combo: string;
    morph: string;
    bomb: string;
    lightning: string;
    rainbow: string;
  };
}

export const TRANSLATIONS: Record<Language, Translations> = {
  tr: {
    mainMenu: {
      play: 'OYNA',
      levels: 'BÖLÜMLER',
      settings: 'AYARLAR',
      levelsCount: (c, t) => `${c} / ${t} BÖLÜM`,
      subtitle: 'Patlat · Eşleştir · Gülümse!',
      rules: '3 veya daha fazla aynı renk tüylüyü eşleştirerek patlat!',
    },
    header: {
      level: (id) => `Bölüm ${id < 10 ? '0' + id : id}`,
      clearBoard: 'Tahtayı Temizle',
      score: 'Skor',
      shots: 'Atış',
      pauseTooltip: 'Oyunu Duraklat',
      restartTooltip: 'Bölümü Yeniden Başlat',
      settingsTooltip: 'Ayarlar',
      skipTooltip: 'Sonraki Seviyeye Geç',
    },
    launcher: {
      next: 'Sıradaki',
      shots: 'Atış',
      dragToAim: 'Hedef Almak İçin Sürükle · Atmak İçin Bırak',
      wheeee: 'Vuuuhuu!',
      swapTooltip: 'Sıradaki top ile değiştir',
    },
    pause: {
      title: 'OYUN DURDURULDU',
      levelScore: (id, score) => `Bölüm ${id < 10 ? '0' + id : id} · Skor: ${score.toLocaleString()}`,
      resume: 'DEVAM ET',
      restart: 'YENİDEN BAŞLAT',
      levels: 'BÖLÜMLER',
      mainMenu: 'ANA MENÜ',
      sound: 'Ses',
      music: 'Müzik',
      on: 'AÇIK',
      off: 'KAPALI',
    },
    gameOver: {
      title: 'OYUNU KAYBETTİN!',
      subtitle: (id, reason) =>
        reason === 'launcher_hit'
          ? 'Toplar atıcıya değdi! Tekrar dene.'
          : `Bölüm ${id < 10 ? '0' + id : id} atış hakkınız bitti! Tekrar dene.`,
      reasonText: (reason) =>
        reason === 'launcher_hit'
          ? 'Toplar atılacak topa ulaştı!'
          : 'Atış hakkınız bitti!',
      fuzziesCleared: 'Temizlenen Toplar',
      remainingOnBoard: 'Tahtada Kalan',
      left: 'kaldı',
      currentScore: 'Mevcut Skor',
      continueShots: '+5 EKSTRA ATIŞ İLE DEVAM ET',
      skipLevel: (id) => `BÖLÜM ${id}'E GEÇ`,
      replay: 'TEKRAR DENE',
      levels: 'BÖLÜMLER',
    },
    levelComplete: {
      title: 'BÖLÜM TAMAMLANDI!',
      fantastic: 'Harika İş!',
      score: 'Kazanılan Skor',
      highScore: 'En Yüksek Skor',
      newRecord: 'YENİ REKOR!',
      nextLevel: 'SONRAKİ BÖLÜM',
      replay: 'TEKRAR OYNA',
      levels: 'BÖLÜMLER',
    },
    settings: {
      title: 'AYARLAR',
      audio: 'SES & MÜZİK',
      soundEffects: 'Ses Efektleri',
      soundEffectsDesc: 'Top patlatma, sekme ve kombo sesleri',
      music: 'Arka Plan Müziği',
      musicDesc: 'Sakinleştirici sevimli oyun melodisi',
      gameplay: 'OYNANIŞ',
      aimAssist: 'Hedefleme Çizgisi',
      aimAssistDesc: 'Duvar yansıma ve iniş noktası rehber çizgisi',
      language: 'DİL / LANGUAGE',
      languageDesc: 'Oyun arayüz dili seçimi',
      turkish: 'Türkçe (Varsayılan)',
      english: 'English',
      dangerZone: 'İLERLEMEYİ SIFIRLA',
      resetDesc: 'Tüm yıldızları ve açılan seviyeleri sıfırlar',
      resetButton: 'TÜM İLERLEMEYİ SIFIRLA',
      confirmReset: 'Tüm oyun ilerlemeniz silinecektir. Emin misiniz?',
      close: 'KAPAT',
    },
    levelSelect: {
      title: 'BÖLÜM SEÇİMİ',
      starsCount: (stars) => `${stars} Yıldız`,
      back: 'Ana Menü',
      locked: 'Kilitli',
    },
    inGameText: {
      drop: 'DÜŞTÜ!',
      combo: 'KOMBO!',
      morph: 'RENK DEĞİŞTİ!',
      bomb: 'BOMBA!',
      lightning: 'YILDIRIM!',
      rainbow: 'GÖKKUŞAĞI!',
    },
  },
  en: {
    mainMenu: {
      play: 'PLAY',
      levels: 'LEVELS',
      settings: 'SETTINGS',
      levelsCount: (c, t) => `${c} / ${t} LEVELS`,
      subtitle: 'Pop · Match · Smile!',
      rules: 'Match 3 or more cute fuzzies of the same color!',
    },
    header: {
      level: (id) => `Level ${id < 10 ? '0' + id : id}`,
      clearBoard: 'Clear Board',
      score: 'Score',
      shots: 'Shots',
      pauseTooltip: 'Pause Game',
      restartTooltip: 'Restart Level',
      settingsTooltip: 'Game Settings',
      skipTooltip: 'Skip to Next Level',
    },
    launcher: {
      next: 'Next',
      shots: 'Shots',
      dragToAim: 'Drag to Aim · Release to Shoot',
      wheeee: 'Wheeee!',
      swapTooltip: 'Swap current & next fuzzy',
    },
    pause: {
      title: 'GAME PAUSED',
      levelScore: (id, score) => `Level ${id < 10 ? '0' + id : id} · Score: ${score.toLocaleString()}`,
      resume: 'RESUME GAME',
      restart: 'RESTART LEVEL',
      levels: 'LEVELS',
      mainMenu: 'MAIN MENU',
      sound: 'Sound',
      music: 'Music',
      on: 'ON',
      off: 'OFF',
    },
    gameOver: {
      title: 'YOU LOST!',
      subtitle: (id, reason) =>
        reason === 'launcher_hit'
          ? 'Fuzzies reached the launcher ball! Try again.'
          : `Out of shots on Level ${id < 10 ? '0' + id : id}! Try again.`,
      reasonText: (reason) =>
        reason === 'launcher_hit'
          ? 'Fuzzies reached the launcher!'
          : 'Out of shots!',
      fuzziesCleared: 'Fuzzies Cleared',
      remainingOnBoard: 'Remaining On Board',
      left: 'left',
      currentScore: 'Current Score',
      continueShots: 'CONTINUE (+5 EXTRA SHOTS)',
      skipLevel: (id) => `SKIP TO LEVEL ${id}`,
      replay: 'TRY AGAIN',
      levels: 'LEVELS',
    },
    levelComplete: {
      title: 'LEVEL CLEARED!',
      fantastic: 'Fantastic Job!',
      score: 'Final Score',
      highScore: 'High Score',
      newRecord: 'NEW RECORD!',
      nextLevel: 'NEXT LEVEL',
      replay: 'REPLAY',
      levels: 'LEVELS',
    },
    settings: {
      title: 'SETTINGS',
      audio: 'AUDIO & SOUND',
      soundEffects: 'Sound Effects',
      soundEffectsDesc: 'Pops, bounces, and combo chimes',
      music: 'Background Music',
      musicDesc: 'Calm, gentle relaxing melody',
      gameplay: 'GAMEPLAY',
      aimAssist: 'Aim Assist Guide Line',
      aimAssistDesc: 'Show bounce trajectory and target reticle',
      language: 'LANGUAGE / DİL',
      languageDesc: 'Choose game display language',
      turkish: 'Türkçe (Default)',
      english: 'English',
      dangerZone: 'RESET PROGRESS',
      resetDesc: 'Reset all unlocked levels and stars',
      resetButton: 'RESET ALL PROGRESS',
      confirmReset: 'Are you sure? All progress will be lost!',
      close: 'CLOSE',
    },
    levelSelect: {
      title: 'SELECT LEVEL',
      starsCount: (stars) => `${stars} Stars`,
      back: 'Main Menu',
      locked: 'Locked',
    },
    inGameText: {
      drop: 'DROP!',
      combo: 'COMBO!',
      morph: 'MORPH!',
      bomb: 'BOMB!',
      lightning: 'LIGHTNING!',
      rainbow: 'RAINBOW!',
    },
  },
};

// Turkish translations for level names and descriptions
export const LEVEL_LOCALIZATION: Record<number, { name: string; description: string }> = {
  1: {
    name: 'Çayır Başlangıcı',
    description: 'İlk adım! Fırlatıcıyı hedef al ve aynı renkteki tüylüleri eşleştir.',
  },
  2: {
    name: 'Gökkuşağı Damlası',
    description: 'Duvarlardan sektirmeyi dene! Açılı atışlar gizli noktaları vurur.',
  },
  3: {
    name: 'Güneş Bahçesi',
    description: 'Üçüncü renk sahneye çıkıyor! Tavana yakın bağlantıları kopar.',
  },
  4: {
    name: 'Bahar Esintisi',
    description: 'Kümeleri hedef al! Üstteki topu vurursan altındakiler yere dökülür.',
  },
  5: {
    name: 'Lavanta Tepeleri',
    description: 'Daha yoğun sıralar! Duvar sekmelerini kullanarak arka sıralara ulaş.',
  },
  6: {
    name: 'Mercan Koyu',
    description: 'Kırmızı tüylüler partiye katılıyor! Tüm tahtayı temizle.',
  },
  7: {
    name: 'Kehribar Işıltısı',
    description: 'Turuncu tüylüler belirdi. Hassas banko atışlar en iyi dostun.',
  },
  8: {
    name: 'Zümrüt Labirent',
    description: 'Elmas dizilimi! Önce yan kanatları düşür.',
  },
  9: {
    name: 'Yakut Kale',
    description: 'Kalın savunma katmanları. Birleşim yerlerini patlatıp kaleyi çökert!',
  },
  10: {
    name: 'Gün Batımı Kulesi',
    description: 'Sarkıt sütunlar! En üstü kopar ve tüm ekranı tek seferde temizle.',
  },
  11: {
    name: 'Bukalemun Vadisi',
    description: 'Renk Değiştiren Top sahnede! Hangi renkle vurursan o renge dönüşür.',
  },
  12: {
    name: 'Kristal Mağara',
    description: 'Dar koridorlar. Bukalemun topu kullanarak zorlu köşeleri aç.',
  },
  13: {
    name: 'Safir Dalgası',
    description: 'Mavi ve mor dalgalar. Akıllıca hedef al ve komboları zincirle.',
  },
  14: {
    name: 'Zümrüt Taç',
    description: 'Kraliyet dizilimi. Çatıyı düşürüp büyük puan bonusu kap!',
  },
  15: {
    name: 'Opal Bahçesi',
    description: 'Bukalemun gücü! Renk değiştirip devasa zincirleme patlama yarat.',
  },
  16: {
    name: 'Çift Bukalemun',
    description: 'Artık 2 adet Renk Değiştiren Top var! Çift yönlü taktik uygula.',
  },
  17: {
    name: 'Yıldız Yağmuru',
    description: 'Gece gökyüzü dizilimi. Banko açıları kullanarak kilit taşları düşür.',
  },
  18: {
    name: 'Kutup Işıkları',
    description: 'Büyüleyici pastel katmanlar. Her atışta maksimum verim al.',
  },
  19: {
    name: 'Volkan Zirvesi',
    description: 'Ateşli kırmızılar ve turuncular. Seviye daralmadan hızlı davran!',
  },
  20: {
    name: 'Büyük Şelale',
    description: 'Dikey akıntı! En üstteki bağı koparınca tüm şelale aşağı dökülür.',
  },
};

const localizedLevelCache = new Map<string, unknown>();

export function getLocalizedLevel<T extends { id: number; name: string; description?: string }>(
  level: T,
  lang: Language
): T {
  if (lang === 'tr' && LEVEL_LOCALIZATION[level.id]) {
    const cacheKey = `tr_${level.id}`;
    if (!localizedLevelCache.has(cacheKey)) {
      localizedLevelCache.set(cacheKey, {
        ...level,
        name: LEVEL_LOCALIZATION[level.id].name,
        description: LEVEL_LOCALIZATION[level.id].description,
      });
    }
    return localizedLevelCache.get(cacheKey) as T;
  }
  return level;
}

