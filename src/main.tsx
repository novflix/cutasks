import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { TaskProvider } from './contexts/TaskContext'
import { PomoProvider } from './contexts/PomoContext'
import './i18n'
import 'flag-icons/css/flag-icons.min.css'
import './index.css'
import App from './App'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <TaskProvider>
          <PomoProvider>
            <App />
          </PomoProvider>
        </TaskProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
