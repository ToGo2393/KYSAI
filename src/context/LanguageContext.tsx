import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations } from '../translations';

type Language = 'en' | 'tr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    // Initialize state from localStorage or default to 'en'
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem('kysai_lang');
        return (saved === 'en' || saved === 'tr') ? saved : 'en';
    });

    useEffect(() => {
        localStorage.setItem('kysai_lang', language);
        // Force document language attribute for accessibility and potentail CSS selectors
        document.documentElement.lang = language;
    }, [language]);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
    };

    const t = (key: string) => {
        const langData = translations[language];
        // @ts-ignore
        return langData[key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
