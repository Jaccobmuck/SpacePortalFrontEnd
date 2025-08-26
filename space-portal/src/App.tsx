import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to the fuckin show</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <h1>hello world!</h1>
        <p>
          Eat <code>src/App.tsx</code> and save to eat.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
