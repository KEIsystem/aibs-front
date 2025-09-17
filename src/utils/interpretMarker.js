// src/utils/interpretMarker.js

// ユーティリティ：全角→半角NFKC、%/％ を除去して数値化
function toNumber(val) {
  if (val === null || val === undefined) return null;
  const s = String(val)
    .normalize('NFKC')       // 全角 → 半角
    .trim()
    .replace(/[%％]/g, '');  // % 記号を除去
  if (s === '') return null;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

// ユーティリティ：AllredのPS/ISを数値化
function toInt(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).normalize('NFKC').trim();
  if (s === '') return null;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

// 詳細ラベル（弱陽性を区別したいとき用）
function detailedLabelFromPercent(p) {
  if (p === null) return '';            // 入力なし → 空（陰性にしない）
  if (p >= 10) return '陽性';
  if (p >= 1)  return '弱陽性';
  return '陰性';
}
function detailedLabelFromAllred(ps, is) {
  if (ps === null && is === null) return ''; // 入力なし → 空
  const total = (ps ?? 0) + (is ?? 0);
  if (total >= 3) return '陽性';
  if (total === 2) return '弱陽性';
  return '陰性';
}

// ★公開：既存関数名はそのまま、内部で正規化を追加
export function interpretERStatus({ useAllred, erPercent, erPS, erIS }) {
  if (useAllred) {
    const ps = toInt(erPS);
    const is = toInt(erIS);
    return detailedLabelFromAllred(ps, is);
  } else {
    const percent = toNumber(erPercent);
    return detailedLabelFromPercent(percent);
  }
}

export function interpretPgRStatus({ useAllred, pgrPercent, pgrPS, pgrIS }) {
  if (useAllred) {
    const ps = toInt(pgrPS);
    const is = toInt(pgrIS);
    return detailedLabelFromAllred(ps, is);
  } else {
    const percent = toNumber(pgrPercent);
    return detailedLabelFromPercent(percent);
  }
}

// ★追加：サーバ向けの正規化（弱陽性→陽性、空→''のまま）
export function toCanonicalHR(label) {
  const s = String(label || '').toLowerCase();
  if (!s) return '';              // 未入力は空で返す（陰性にしない）
  if (s.includes('陰')) return '陰性';
  // 弱陽性/陽性/pos/true はすべて陽性扱い
  return '陽性';
}
