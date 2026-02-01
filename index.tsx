import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import VConsole from 'vconsole';

// Initialize vConsole for mobile debugging
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
  new VConsole();
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);