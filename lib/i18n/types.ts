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
    badge: string;
    heroTitle: string;
    heroSubtitle: string;
    heroCtaPrimary: string;
    heroCtaSecondary: string;
    modulesTitle: string;
    modulesSubtitle: string;
    modulePankhAiTitle: string;
    modulePankhAiSub: string;
    modulePankhAiDesc: string;
    moduleSentinelTitle: string;
    moduleSentinelSub: string;
    moduleSentinelDesc: string;
    moduleConnectTitle: string;
    moduleConnectSub: string;
    moduleConnectDesc: string;
    moduleEconomicsTitle: string;
    moduleEconomicsSub: string;
    moduleEconomicsDesc: string;
    footerText: string;
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
