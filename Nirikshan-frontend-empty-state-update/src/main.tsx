import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './styles.css';
import App from './App';
import { StoreProvider } from './store';
import { ToastProvider } from './toast';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </StoreProvider>
  </React.StrictMode>,
);
