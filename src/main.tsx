import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './hooks'
import { SettingsProvider } from './lib/contexts/SettingsContext'
import App from './App.tsx'
import './index.css'
import 'react-toastify/dist/ReactToastify.css'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </AuthProvider>
  </BrowserRouter>
);
