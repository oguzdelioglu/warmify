
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TRANSLATIONS, Language } from './translations';
import { UserSettings } from '../../types';

interface LocalizationContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('warmify_language');
        if (saved) return saved as Language;

        // Auto-detect
        const browserLang = navigator.language.split('-')[0];
        if (['es', 'fr', 'de', 'it', 'pt', 'ru', 'jp', 'kr', 'cn', 'tr'].includes(browserLang)) {
            return browserLang as Language;
        }
        return 'en';
    });

    useEffect(() => {
        localStorage.setItem('warmify_language', language);
    }, [language]);

    const t = (key: string): string => {
        const langDict = TRANSLATIONS[language];
        if (langDict && langDict[key]) {
            return langDict[key];
        }
        // Fallback to English
        return TRANSLATIONS['en'][key] || key;
    };

    return (
        <LocalizationContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LocalizationContext.Provider>
    );
};

export const useLocalization = () => {
    const context = useContext(LocalizationContext);
    if (!context) {
        throw new Error('useLocalization must be used within a LocalizationProvider');
    }
    return context;
};
