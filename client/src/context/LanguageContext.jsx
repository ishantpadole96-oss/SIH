import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';
import { translateText } from '../i18n/domTranslations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('ruralcare_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('ruralcare_lang', lang);
  }, [lang]);

  // Global DOM real-time translation observer
  useEffect(() => {
    if (lang === 'en') return;

    let isTranslating = false;

    const translateDom = (root = document.body) => {
      if (!root || isTranslating) return;
      isTranslating = true;

      try {
        const walker = document.createTreeWalker(
          root,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode(node) {
              const parent = node.parentElement;
              if (!parent) return NodeFilter.FILTER_REJECT;
              const tag = parent.tagName;
              if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
                return NodeFilter.FILTER_REJECT;
              }
              if (parent.isContentEditable) return NodeFilter.FILTER_REJECT;
              if (node.nodeValue && node.nodeValue.trim().length > 0) {
                return NodeFilter.FILTER_ACCEPT;
              }
              return NodeFilter.FILTER_REJECT;
            }
          }
        );

        let currentNode;
        while ((currentNode = walker.nextNode())) {
          const original = currentNode.nodeValue;
          const translated = translateText(original, lang);
          if (translated !== original) {
            currentNode.nodeValue = translated;
          }
        }
      } catch (err) {
        console.error('DOM Translation error:', err);
      } finally {
        isTranslating = false;
      }
    };

    // Run immediately and after a short tick for dynamic React elements
    translateDom();
    const timeoutId = setTimeout(translateDom, 100);

    // Observe subsequent DOM mutations (React rerenders, route changes, data fetching)
    const observer = new MutationObserver((mutations) => {
      if (isTranslating) return;
      let hasChanges = false;
      for (const m of mutations) {
        if (m.type === 'childList' || (m.type === 'characterData' && m.target?.nodeValue)) {
          hasChanges = true;
          break;
        }
      }
      if (hasChanges) {
        translateDom();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [lang]);

  const t = (key) => {
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    // Fallback dictionary lookup for arbitrary text strings
    const fallback = translateText(key, lang);
    if (fallback !== key) {
      return fallback;
    }
    // Fallback to English translation
    return (translations['en'] && translations['en'][key]) || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, language: lang, setLanguage: setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
