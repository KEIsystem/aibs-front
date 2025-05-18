import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const allowedPath = '/secret2025keikuhpbrca';

if (window.location.pathname.startsWith(allowedPath)) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  document.body.innerHTML = `
    <div style="text-align: center; margin-top: 5rem; font-family: sans-serif;">
      <h2>このページは非公開です</h2>
      <p>正しいURLをご確認ください。</p>
    </div>
  `;
}