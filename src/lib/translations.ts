import translationsData from './translations.json';

export type Language = 'ar' | 'fr';

export const translations = translationsData as Record<Language, any>;
