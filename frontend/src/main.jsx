import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import 'boxicons/css/boxicons.min.css'
import './index.css'
import App from './App.jsx'
import { GameLibraryProvider } from './contexts/GameLibraryContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <GameLibraryProvider>
        <App />
      </GameLibraryProvider>
    </BrowserRouter>
  </StrictMode>,
)
