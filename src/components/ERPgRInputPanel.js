// src/components/ERPgRInputPanel.js
import React from 'react';

function ERPgRInputPanel({
  useAllred, setUseAllred,
  erPercent, setErPercent,
  pgrPercent, setPgrPercent,
  erPS, setErPS, erIS, setErIS,
  pgrPS, setPgrPS, pgrIS, setPgrIS
}) {
  // 文字列→安全な数値文字列（空は空で保持）
  const sanitizeInt = (v) => {
    if (v === '' || v === null || v === undefined) return '';
    const n = String(v).replace(/[^\d.-]/g, '');
    return n;
  };

  // % 用（0–100）
  const onChangePercent = (setter) => (e) => {
    const v = sanitizeInt(e.target.value);
    setter(v);
  };
  const onBlurPercent = (getter, setter) => () => {
    const raw = getter();
    if (raw === '') return; // 未入力は未入力のまま
    let n = Number(raw);
    if (!Number.isFinite(n)) { setter(''); return; }
    if (n < 0) n = 0;
    if (n > 100) n = 100;
    setter(String(n));
  };

  // Allred: PS 0–5, IS 0–3（一般的な定義）
  const onChangePS = (setter, max) => (e) => {
    const v = sanitizeInt(e.target.value);
    // 入力途中の空は許容
    if (v === '') { setter(''); return; }
    let n = Number(v);
    if (!Number.isFinite(n)) { setter(''); return; }
    if (n < 0) n = 0;
    if (n > max) n = max;
    setter(String(n));
  };

  const handleToggleAllred = (checked) => {
    setUseAllred(checked);
    // 片側方式に切替時は反対側をクリア（誤送信防止）
    if (checked) {
      setErPercent(''); setPgrPercent('');
    } else {
      setErPS(''); setErIS(''); setPgrPS(''); setPgrIS('');
    }
  };

  return (
    <fieldset className="border p-3 rounded mb-4">
      <legend className="font-semibold">ER / PgR 入力</legend>

      <label>
        <input
          type="checkbox"
          checked={useAllred}
          onChange={(e) => handleToggleAllred(e.target.checked)}
        />{' '}
        Allredスコアで入力
        <span className="text-gray-500 text-sm ml-2">
          （%方式: 0–100 ／ Allred: ER/PgR PS 0–5, IS 0–3）
        </span>
      </label>

      {!useAllred ? (
        <div className="space-y-2 mt-3">
          <label>ER（％）：
            <input
              type="number"
              inputMode="numeric"
              pattern="\d*"
              min={0}
              max={100}
              step={1}
              value={erPercent}
              onChange={onChangePercent(setErPercent)}
              onBlur={onBlurPercent(() => erPercent, setErPercent)}
              placeholder="0〜100"
            />
          </label>
          <br />
          <label>PgR（％）：
            <input
              type="number"
              inputMode="numeric"
              pattern="\d*"
              min={0}
              max={100}
              step={1}
              value={pgrPercent}
              onChange={onChangePercent(setPgrPercent)}
              onBlur={onBlurPercent(() => pgrPercent, setPgrPercent)}
              placeholder="0〜100"
            />
          </label>
        </div>
      ) : (
        <div className="space-y-2 mt-3">
          <div className="mb-1 font-medium">ER（Allred）</div>
          <label>PS（0–5）：
            <input
              type="number"
              inputMode="numeric"
              pattern="\d*"
              min={0}
              max={5}
              step={1}
              value={erPS}
              onChange={onChangePS(setErPS, 5)}
              placeholder="0〜5"
            />
          </label>
          <label className="ml-3">IS（0–3）：
            <input
              type="number"
              inputMode="numeric"
              pattern="\d*"
              min={0}
              max={3}
              step={1}
              value={erIS}
              onChange={onChangePS(setErIS, 3)}
              placeholder="0〜3"
            />
          </label>

          <div className="mt-3 mb-1 font-medium">PgR（Allred）</div>
          <label>PS（0–5）：
            <input
              type="number"
              inputMode="numeric"
              pattern="\d*"
              min={0}
              max={5}
              step={1}
              value={pgrPS}
              onChange={onChangePS(setPgrPS, 5)}
              placeholder="0〜5"
            />
          </label>
          <label className="ml-3">IS（0–3）：
            <input
              type="number"
              inputMode="numeric"
              pattern="\d*"
              min={0}
              max={3}
              step={1}
              value={pgrIS}
              onChange={onChangePS(setPgrIS, 3)}
              placeholder="0〜3"
            />
          </label>
        </div>
      )}
    </fieldset>
  );
}

export default ERPgRInputPanel;
