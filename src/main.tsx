import './lib/array-polyfill';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Global error handler to catch filter errors
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('filter is not a function')) {
    console.error('Global error handler caught filter error:', event.error);
    console.error('Error stack:', event.error.stack);
    console.error('Error location:', event.filename, event.lineno, event.colno);
    
    // Prevent the error from crashing the app
    event.preventDefault();
    
    // Optionally show a user-friendly message
    const errorMessage = document.createElement('div');
    errorMessage.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #fef2f2;
      border: 1px solid #fecaca;
      color: #dc2626;
      padding: 12px;
      border-radius: 6px;
      z-index: 9999;
      font-family: sans-serif;
      font-size: 14px;
      max-width: 300px;
    `;
    errorMessage.textContent = 'A data loading error occurred. Please refresh the page.';
    document.body.appendChild(errorMessage);
    
    // Remove the message after 5 seconds
    setTimeout(() => {
      if (errorMessage.parentNode) {
        errorMessage.parentNode.removeChild(errorMessage);
      }
    }, 5000);
  }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('filter is not a function')) {
    console.error('Global unhandled promise rejection caught filter error:', event.reason);
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
