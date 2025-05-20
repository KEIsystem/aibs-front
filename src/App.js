// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CaseTypeSelector from './CaseTypeSelector';
import ChangeLogPage from './pages/ChangeLogPage';

function App() {
  return (
    <Router>
      <div className="App min-h-screen flex flex-col">
        <header className="p-4">
          <h1 className="text-2xl font-bold">AI Breast Surgeon (AIBS) Project: 症例情報入力による推奨治療システム Ver.1.0</h1>
        </header>

        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<CaseTypeSelector />} />
            <Route path="/changelog" element={<ChangeLogPage />} />
          </Routes>
        </main>

        <footer className="p-2 text-sm text-center border-t">
          <Link to="/changelog">📝 変更履歴</Link>
        </footer>
      </div>
    </Router>
  );
}

export default App;
