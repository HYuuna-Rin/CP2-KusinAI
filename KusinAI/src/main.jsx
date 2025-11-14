/*
  File: src/main.jsx
  Purpose: React application bootstrap.
  Responsibilities:
  - Initialize root rendering and attach React Router/Tailwind setup.
  - Import global styles and render <App/>.
  Notes: Avoid app logic here; keep it minimal and stable.
*/
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { setupIonicReact, IonApp } from '@ionic/react';
import { BrowserRouter } from 'react-router-dom';
import DeepLinkHandler from './DeepLinkHandler.jsx'; // ✅ add this import

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <IonApp>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <DeepLinkHandler /> {/* ✅ Add listener */}
            <App />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </IonApp>
  </React.StrictMode>
);
