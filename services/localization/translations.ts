
import { TranslationKeys, Language } from './types';
import { en } from './locales/en';
import { tr } from './locales/tr';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { it } from './locales/it';
import { pt } from './locales/pt';
import { ru } from './locales/ru';
import { jp } from './locales/jp';
import { kr } from './locales/kr';
import { cn } from './locales/cn';

export type { Language };

export const TRANSLATIONS: Record<Language, TranslationKeys> = {
    en,
    tr,
    es,
    fr,
    de,
    it,
    pt,
    ru,
    jp,
    kr,
    cn
};
