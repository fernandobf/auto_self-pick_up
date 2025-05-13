import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from "react-router-dom"; // Envolva a aplicação com o Router
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router> {/* Envolva toda a aplicação com Router */}
      <App />
    </Router>
  </StrictMode>
);