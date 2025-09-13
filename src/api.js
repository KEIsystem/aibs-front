// aibs-front/src/api.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ← api.create の直後あたりに
async function safeRequest(promise) {
  try {
    const res = await promise;
    return res.data;
  } catch (error) {
    if (error?.response) {
      throw new Error(`API Error ${error.response.status}: ${JSON.stringify(error.response.data)}`);
    }
    throw error;
  }
}


// =================== 術前フォーム（preoperative） ===================
// サーバが術後と同様に基本情報をトップレベルで受け取る前提でフラット化。
// family_history もブールのオブジェクトへ正規化。
function buildPreoperativePayload(data, patientId = null) {
  const b = data.basic_info || {};
  const other = b.other_info || {};
  const fam = b.family_history || b.family_history_list || {};

  const family_history = {
    breast: !!fam.breast || (Array.isArray(fam) && fam.includes('breast')),
    ovary: !!fam.ovary || (Array.isArray(fam) && fam.includes('ovary')),
    peritoneum: !!fam.peritoneum || (Array.isArray(fam) && fam.includes('peritoneum')),
    pancreas: !!fam.pancreas || (Array.isArray(fam) && fam.includes('pancreas')),
    others: !!fam.others || (Array.isArray(fam) && fam.includes('others')),
  };

  return {
    // ▼ トップレベル
    patient_id: patientId ?? (data.patient_id ?? ''),
    age: b.age ?? null,
    birth_date: b.birth_date ?? '',
    gender: b.gender ?? '',
    is_premenopausal: !!b.is_premenopausal,
    gbrca: other.gBRCA ?? '未検査',
    frailty: other.frailty ?? false,
    past_medical_history: b.past_treatment ?? '',
    medications: b.medications ?? '',
    family_history,

    // ▼ 術前は主要病変情報を primary_tumor_info にまとめて送る（既存UIの形を踏襲）
    primary_tumor_info: data.primary_tumor_info || {},
  };
}

export async function createPreoperative(data, patientId = null) {
  const payload = buildPreoperativePayload(data, patientId);
  return safeRequest(api.post('/api/preoperative/', payload));
}

export async function updatePreoperative(patientId, data) {
  if (!patientId) throw new Error('patient_id is required');
  const payload = buildPreoperativePayload(data, patientId);
  return safeRequest(api.put(`/api/preoperative/${encodeURIComponent(patientId)}/`, payload));
}

/** patientId があれば PUT、なければ POST */
export async function sendPreoperativeData(data, patientId = null) {
  return patientId
    ? updatePreoperative(patientId, data)
    : createPreoperative(data, data.patient_id || null);
}


// =================== 術後フォーム（postoperative） ===================
// サーバは basic 情報をトップレベルで受け取っているので平坦化して送る。
// さらに patient_id も同梱する。

function buildPostoperativePayload(data, patientId = null) {
  const b = data.basic_info || {};
  const other = (b.other_info || {});

  // family_history: UI 側の配列/真偽からサーバ期待の形へ
  const fam = b.family_history || b.family_history_list || {};
  const family_history = {
    breast: !!fam.breast || (Array.isArray(fam) && fam.includes('breast')),
    ovary: !!fam.ovary || (Array.isArray(fam) && fam.includes('ovary')),
    peritoneum: !!fam.peritoneum || (Array.isArray(fam) && fam.includes('peritoneum')),
    pancreas: !!fam.pancreas || (Array.isArray(fam) && fam.includes('pancreas')),
    others: !!fam.others || (Array.isArray(fam) && fam.includes('others')),
  };

  return {
    // ▼ トップレベル（ログと同じキー）
    patient_id: patientId ?? (data.patient_id ?? ''), // 空なら''のままでも動作はするが、可能ならIDを入れる
    age: b.age ?? null,
    birth_date: b.birth_date ?? '',
    gender: b.gender ?? '',
    is_premenopausal: !!b.is_premenopausal,
    gbrca: other.gBRCA ?? '未検査',
    frailty: other.frailty ?? false,
    past_medical_history: b.past_treatment ?? '',
    medications: b.medications ?? '',
    family_history,

    // ▼ そのままネストで送る（ログもこの形）
    primary_tumor_info: data.primary_tumor_info || {},
    preoperative: data.preoperative || {},
  };
}

export async function createPostoperative(data, patientId = null) {
  const payload = buildPostoperativePayload(data, patientId);
  return safeRequest(api.post('/api/postoperative/', payload));
}

export async function updatePostoperative(patientId, data) {
  if (!patientId) throw new Error('patientId is required');
  const payload = buildPostoperativePayload(data, patientId);
  return safeRequest(api.put(`/api/postoperative/${encodeURIComponent(patientId)}/`, payload));
}

export async function sendPostoperativeData(data, patientId = null) {
  // patientId があれば PUT、なければ POST
  return patientId
    ? updatePostoperative(patientId, data)
    : createPostoperative(data, data.patient_id || null);
}

// =================== 転移・再発フォーム（metastatic） ===================
// 術後と同様、基本情報はトップレベル、病勢情報は metastasis_info に入れて送る想定。
function buildMetastaticPayload(data, patientId = null) {
  const b = data.basic_info || {};
  const other = b.other_info || {};
  const fam = b.family_history || b.family_history_list || {};

  const family_history = {
    breast: !!fam.breast || (Array.isArray(fam) && fam.includes('breast')),
    ovary: !!fam.ovary || (Array.isArray(fam) && fam.includes('ovary')),
    peritoneum: !!fam.peritoneum || (Array.isArray(fam) && fam.includes('peritoneum')),
    pancreas: !!fam.pancreas || (Array.isArray(fam) && fam.includes('pancreas')),
    others: !!fam.others || (Array.isArray(fam) && fam.includes('others')),
  };

  return {
    patient_id: patientId ?? (data.patient_id ?? ''),
    age: b.age ?? null,
    birth_date: b.birth_date ?? '',
    gender: b.gender ?? '',
    is_premenopausal: !!b.is_premenopausal,
    gbrca: other.gBRCA ?? '未検査',
    frailty: other.frailty ?? false,
    past_medical_history: b.past_treatment ?? '',
    medications: b.medications ?? '',
    family_history,

    metastasis_info: data.metastasis_info || {},
  };
}

export async function createMetastatic(data, patientId = null) {
  const payload = buildMetastaticPayload(data, patientId);
  // 新規は /api/metastatic/submit
  return safeRequest(api.post('/api/metastatic/submit', payload));
}

export async function updateMetastatic(patientId, data) {
  if (!patientId) throw new Error('patient_id is required');
  const payload = buildMetastaticPayload(data, patientId);
  // 更新は /api/metastatic/<id>/submit
  return safeRequest(api.put(`/api/metastatic/${encodeURIComponent(patientId)}/submit`, payload));
}

/** isUpdateMode && patientId なら更新、なければ新規 */
export async function sendPostProgressionData(data, isUpdateMode = false, patientId = null) {
  return isUpdateMode && patientId
    ? updateMetastatic(patientId, data)
    : createMetastatic(data, data.patient_id || null);
}


export async function fetchPatientData(patientId) {
  if (!patientId) throw new Error('patientId is required');
  return safeRequest(api.get(`/api/patient/${encodeURIComponent(patientId)}/`));
}

export async function fetchUnifiedPatientData(patientId) {
  if (!patientId) throw new Error('patientId is required');
  return safeRequest(api.get(`/api/unified/${encodeURIComponent(patientId)}/`));
}


export default api;
