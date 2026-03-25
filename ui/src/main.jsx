import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import './index.css';
import { store } from './store/store';
import App from './App.jsx';
import { LocationProvider } from './contexts/LocationContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <LocationProvider>
        <BrowserRouter>
          <App />
          <Toaster position="top-right" />
        </BrowserRouter>
      </LocationProvider>
    </Provider>
  </StrictMode>,
);
