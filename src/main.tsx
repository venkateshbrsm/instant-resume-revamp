import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

// Defensive rendering with error handling
function renderApp() {
  try {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to render app:", error);
    // Fallback rendering
    root.render(
      <div style={{ 
        padding: '20px', 
        fontFamily: 'system-ui', 
        textAlign: 'center',
        color: '#dc2626'
      }}>
        <h1>Application Error</h1>
        <p>Please refresh the page to try again.</p>
      </div>
    );
  }
}

renderApp();
