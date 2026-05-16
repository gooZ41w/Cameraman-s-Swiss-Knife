import React from 'react'
import ReactDOM from 'react-dom/client'
import { AppShell } from './presentation/components/AppShell'
import './presentation/global.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
)
