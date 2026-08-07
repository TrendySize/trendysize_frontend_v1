import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const storedTheme = window.localStorage.getItem('theme')
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
  document.documentElement.classList.add('dark')
  document.body.classList.add('dark')
} else {
  document.documentElement.classList.remove('dark')
  document.body.classList.remove('dark')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
