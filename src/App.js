// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CaseTypeSelector from './CaseTypeSelector';
import ChangeLogPage from './pages/ChangeLogPage'; // 👈追加

function App() {
  return (
    <Router>
      <div className="App p-6 space-y-6">
        <h1 className="text-xl font-bold">
          AI Breast Surgeon (AIBS) Project: 症例情報入力による推奨治療システム Ver.1.1
        </h1>
        <nav>
          <Link to="/" className="text-blue-600 hover:underline mr-4">ホーム</Link>
          <Link to="/changelog" className="text-blue-600 hover:underline">📝 変更履歴</Link>
        </nav>
        <Routes>
          <Route path="/" element={<CaseTypeSelector />} />
          <Route path="/changelog" element={<ChangeLogPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
