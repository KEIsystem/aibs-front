// src/App.js
import React from 'react';
import CaseTypeSelector from './CaseTypeSelector';

function App() {
  return (
    <div className="App">
      <h1>AI Breast Surgeon (AIBS) Project:症例情報入力による推奨治療システム　Ver.1.0</h1>
      <CaseTypeSelector />
    </div>
  );
}

export default App;
