//aibs-front\src\components\FoundationOnePanel.js
import React, { useState } from 'react';

function FoundationOneInput() {
  const [status, setStatus] = useState('未検査');
  const [examDate, setExamDate] = useState('');
  const [comment, setComment] = useState('');

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-4">
        <label className="font-bold">Foundation One：</label>
        <label className="flex items-center space-x-1">
          <input
            type="radio"
            name="foundationOne"
            value="未検査"
            checked={status === '未検査'}
            onChange={() => setStatus('未検査')}
          />
          <span>未検査</span>
        </label>
        <label className="flex items-center space-x-1">
          <input
            type="radio"
            name="foundationOne"
            value="検査済"
            checked={status === '検査済'}
            onChange={() => setStatus('検査済')}
          />
          <span>検査済</span>
        </label>
        {status === '検査済' && (
          <div className="flex items-center space-x-2">
            <label className="text-sm">検査日：</label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
        )}
      </div>

      {status === '検査済' && (
        <div className="mt-2">
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="自由記載（例：MSI-High, TMB 14, PIK3CA変異 など）"
            className="w-full border rounded px-2 py-1"
          />
        </div>
      )}
    </div>
  );
}

export default FoundationOneInput;
