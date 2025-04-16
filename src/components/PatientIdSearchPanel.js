// ✅ frontend/src/components/PatientIdSearchPanel.js
import React, { useState } from 'react';

function PatientIdSearchPanel({ patientId, setPatientId, onSearch }) {
  const [status, setStatus] = useState(''); // '', 'success', 'not_found'

  const handleSearchClick = async () => {
    if (!patientId) return;

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/patient/${patientId}/`);
      if (!res.ok) {
        setStatus('not_found');
        return;
      }

      const data = await res.json();
      await onSearch(data);
      setStatus('success');
    } catch (err) {
      setStatus('not_found');
    }
  };

  return (
    <div className="flex items-center space-x-3 mb-4">
      <label className="font-semibold">患者ID：</label>
      <input
        type="text"
        value={patientId}
        onChange={(e) => {
          setPatientId(e.target.value);
          setStatus('');
        }}
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
