// aibs-front/src/components/PatientIdSearchPanel.js
import React, { useState, useEffect } from 'react';
import { fetchPatientData } from '../api';

function PatientIdSearchPanel({ patientId, setPatientId, onSearch, onReset }) {
  const [status, setStatus] = useState(''); // '', 'success', 'not_found'

  const handleSearchClick = async () => {
    if (!patientId) return;

    try {
      const data = await fetchPatientData(patientId);
      await onSearch(data);
      setStatus('success');
    } catch {
      setStatus('not_found');
    }
  };

  useEffect(() => {
    //  ID変更時にリセットを呼び出す
    if (onReset) {
      onReset();
    }
    setStatus('');
  }, [patientId]);

  return (
    <div className="flex items-center space-x-3 mb-4">
      <label className="font-semibold">患者ID：</label>
      <input
        type="text"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
        className="border px-2 py-1"
      />
      <button
        onClick={handleSearchClick}
        type="button"
        className="bg-blue-600 text-white px-3 py-1 rounded"
      >
        検索
      </button>
      {status === 'success' && <span className="text-green-600">保存データを読み込みました</span>}
      {status === 'not_found' && <span className="text-red-600">患者情報が見つかりません</span>}
    </div>
  );
}

export default PatientIdSearchPanel;
