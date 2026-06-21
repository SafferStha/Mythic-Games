import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'

import 'boxicons/css/boxicons.min.css'
import './index.css'

import App from './App.jsx'
import { GameLibraryProvider } from './contexts/GameLibraryContext.jsx'
import { queryClient } from './lib/queryClient.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <GameLibraryProvider>
          <App />
          <Toaster
            position="top-right"
            expand={false}
            richColors
            closeButton
            toastOptions={{
              style: {
                background: '#1E293B',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#F8FAFC',
              },
            }}
          />
        </GameLibraryProvider>
      </BrowserRouter>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
