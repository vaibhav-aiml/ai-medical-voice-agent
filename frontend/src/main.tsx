import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import './index.css'
import { SubscriptionProvider } from './context/SubscriptionContext';

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_aGVscGluZy10aWdlci0xMy5jbGVyay5hY2NvdW50cy5kZXYk'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
        <ThemeProvider>
          <LanguageProvider>
            <SubscriptionProvider>
              <App />
            </SubscriptionProvider>
          </LanguageProvider>
        </ThemeProvider>
      </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>,
)