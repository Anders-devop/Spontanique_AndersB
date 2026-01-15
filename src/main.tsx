import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { Toaster } from '@/components/ui/sonner';

// [RATIONALE]: Internationalization (i18n) Foundation
// Automatically detect the user's browser locale (e.g., 'da-DK', 'en-US', 'sv-SE', 'de-DE').
// This ensures native HTML inputs (like date pickers) and formatting libraries automatically
// match the user's regional preferences without hardcoding any specific locale.
// Example: Danish user sees dd-mm-yyyy, American user sees mm/dd/yyyy, Swedish user sees yyyy-mm-dd.
// This prepares the application for international expansion (Stockholm, Berlin, London, etc.)
// without requiring code changes per market.
const userLocale = navigator.language || navigator.languages?.[0] || 'da-DK';
const languageCode = userLocale.split('-')[0]; // Extract language: 'da', 'en', 'sv', 'de', etc.

// Dynamically set HTML lang attribute for proper browser formatting
document.documentElement.lang = languageCode;

// Development logging for locale debugging
if (import.meta.env.DEV) {
  console.log('🌍 System Locale Detected:', userLocale, '| Language Code:', languageCode);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>,
);
