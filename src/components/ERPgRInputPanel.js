// src/components/ERPgRInputPanel.js
import React from 'react';

function ERPgRInputPanel({
  useAllred, setUseAllred,
  erPercent, setErPercent,
  pgrPercent, setPgrPercent,
  erPS, setErPS, erIS, setErIS,
  pgrPS, setPgrPS, pgrIS, setPgrIS
}) {
  return (
    <fieldset className="border p-3 rounded mb-4">
      <legend className="font-semibold">ER / PgR 入力</legend>

      <label>
        <input
          type="checkbox"
          checked={useAllred}
          onChange={(e) => setUseAllred(e.target.checked)}
        /> Allredスコアで入力
      </label>

      {!useAllred ? (
        <div className="space-y-2 mt-2">
          <label>ER（％）：
            <input type="number" value={erPercent} onChange={e => setErPercent(e.target.value)} />
          </label><br />
          <label>PgR（％）：
            <input type="number" value={pgrPercent} onChange={e => setPgrPercent(e.target.value)} />
          </label>
        </div>
      ) : (
        <div className="space-y-2 mt-2">
          <label>ER（PS）：
            <input type="number" value={erPS} onChange={e => setErPS(e.target.value)} />
          </label>
          <label>ER（IS）：
            <input type="number" value={erIS} onChange={e => setErIS(e.target.value)} />
          </label>
          <br />
          <label>PgR（PS）：
            <input type="number" value={pgrPS} onChange={e => setPgrPS(e.target.value)} />
          </label>
          <label>PgR（IS）：
            <input type="number" value={pgrIS} onChange={e => setPgrIS(e.target.value)} />
          </label>
        </div>
      )}
    </fieldset>
  );
}

export default ERPgRInputPanel;
