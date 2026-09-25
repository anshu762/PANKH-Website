export type SupportedLanguage = "pa" | "en" | "hi" | "hinglish";

export interface LanguageInfo {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface Dictionary {
  common: {
    platformName: string;
    tagline: string;
    login: string;
    register: string;
    signOut: string;
    dashboard: string;
    adminConsole: string;
    getStarted: string;
    loading: string;
    role: string;
    welcome: string;
    home: string;
    accessDenied: string;
    accessDeniedDesc: string;
  };
  marketing: {
    hero: {
      badge: string;
      headline: string;
      subheadlineGurmukhi: string;
      subheadline: string;
      ctaPrimary: string;
      ctaSecondary: string;
      trustZeroFee: string;
      trustOneAccount: string;
      trustOffline: string;
      sentinelActive: string;
      shedLabel: string;
      broilerBatch: string;
      fcrStatus: string;
    };
    problem: {
      eyebrow: string;
      title: string;
      interventionPoint: string;
      items: Array<{
        stat: string;
        label: string;
        desc: string;
      }>;
    };
    modules: {
      eyebrow: string;
      title: string;
      subtitle: string;
      coreOutputLabel: string;
      ai: {
        badge: string;
        pill: string;
        title: string;
        desc: string;
        output: string;
        bullet1: string;
        bullet2: string;
      };
      sentinel: {
        badge: string;
        pill: string;
        title: string;
        desc: string;
        output: string;
        bullet1: string;
        bullet2: string;
      };
      connect: {
        badge: string;
        pill: string;
        title: string;
        desc: string;
        output: string;
        bullet1: string;
        bullet2: string;
      };
      economics: {
        badge: string;
        pill: string;
        title: string;
        desc: string;
        output: string;
        bullet1: string;
        bullet2: string;
      };
    };
    howAiAnswers: {
      eyebrow: string;
      title: string;
      subtitle: string;
      questionContext: string;
      questionText: string;
      step1: { name: string; title: string; badge: string; text: string };
      step2: { name: string; title: string; badge: string; bullets: string[] };
      step3: { name: string; title: string; badge: string; bullets: string[] };
      step4: { name: string; title: string; badge: string; text: string };
      step5: { name: string; title: string; badge: string; text: string };
      step6: { name: string; title: string; badge: string; text: string };
    };
    safety: {
      badge: string;
      quote: string;
      desc: string;
      pillar1Title: string;
      pillar1Desc: string;
      pillar2Title: string;
      pillar2Desc: string;
      pillar3Title: string;
      pillar3Desc: string;
    };
    accessibility: {
      badge: string;
      title: string;
      desc: string;
      feature1Title: string;
      feature1Desc: string;
      feature2Title: string;
      feature2Desc: string;
      feature3Title: string;
      feature3Desc: string;
      demoLabel: string;
      demoHint: string;
    };
    footer: {
      desc: string;
      modulesColTitle: string;
      farmerColTitle: string;
      moduleAi: string;
      moduleSentinel: string;
      moduleConnect: string;
      moduleEconomics: string;
      farmerLogin: string;
      createAccount: string;
      vetPortal: string;
      disclaimer: string;
      creditPre: string;
      creditAuthor: string;
      creditPost: string;
    };
  };
  auth: {
    loginTitle: string;
    loginSubtitle: string;
    registerTitle: string;
    registerSubtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    roleLabel: string;
    roleFarmer: string;
    roleVet: string;
    languageLabel: string;
    loginButton: string;
    loggingInButton: string;
    registerButton: string;
    registeringButton: string;
    noAccount: string;
    alreadyHaveAccount: string;
    loginLink: string;
    registerLink: string;
  };
  farmer: {
    portalTitle: string;
    welcomeBannerTitle: string;
    welcomeBannerDesc: string;
    dailyLogCardTitle: string;
    dailyLogCardValue: string;
    dailyLogCardHint: string;
    sentinelCardTitle: string;
    sentinelCardValue: string;
    sentinelCardHint: string;
    casesCardTitle: string;
    casesCardValue: string;
    casesCardHint: string;
    economicsCardTitle: string;
    economicsCardValue: string;
    economicsCardHint: string;
  };
  admin: {
    consoleTitle: string;
    welcomeBannerTitle: string;
    welcomeBannerDesc: string;
    usersCardTitle: string;
    usersCardValue: string;
    usersCardHint: string;
    thresholdsCardTitle: string;
    thresholdsCardValue: string;
    thresholdsCardHint: string;
    auditCardTitle: string;
    auditCardValue: string;
    auditCardHint: string;
    kbCardTitle: string;
    kbCardValue: string;
    kbCardHint: string;
  };
}
