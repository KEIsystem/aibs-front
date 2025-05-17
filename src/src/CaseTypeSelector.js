// src/CaseTypeSelector.js
import React, { useState } from 'react';
import PreoperativeForm from './PreoperativeForm';
import PostoperativeForm from './PostoperativeForm';
import PostProgressionTreatmentForm from './PostProgressionTreatmentForm';

function CaseTypeSelector() {
  const [selectedCaseType, setSelectedCaseType] = useState('');

  return (
    <div>
      <h2>症例タイプ選択</h2>
      <select
        value={selectedCaseType}
        onChange={(e) => setSelectedCaseType(e.target.value)}
      >
        <option value="">選択してください</option>
        <option value="preoperative">術前</option>
        <option value="postoperative">術後</option>
        <option value="post_progression_treatment">転移・再発治療</option>
      </select>

      <div style={{ marginTop: '20px' }}>
        {selectedCaseType === 'preoperative' && <PreoperativeForm />}
        {selectedCaseType === 'postoperative' && <PostoperativeForm />}
        {selectedCaseType === 'post_progression_treatment' && <PostProgressionTreatmentForm />}
      </div>
    </div>
  );
}

export default CaseTypeSelector;
