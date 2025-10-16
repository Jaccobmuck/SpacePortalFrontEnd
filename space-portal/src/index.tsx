// Import React core library to use JSX and components
import React from 'react';

// Import the React 18 root API for creating a concurrent root
import ReactDOM from 'react-dom/client';

// Global stylesheet for base styles
import './index.css';

// Root application component
import App from './App';

// CRA's web vitals helper for performance measurements
import reportWebVitals from './reportWebVitals';

// BrowserRouter provides HTML5 history-based routing for the app
import { BrowserRouter } from 'react-router-dom';

// Create a React root attached to the DOM node with id="root"
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render the application tree into the root
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
