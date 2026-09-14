import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setLogLevel } from 'firebase/firestore';

// Silence non-fatal offline backend messages from Firestore SDK
try {
  setLogLevel('silent');
} catch {}

import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
