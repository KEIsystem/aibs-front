// aibs-front/src/api.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * ──────────── 術前フォーム ────────────
 *  ・新規登録: POST /api/preoperative/
 *  ・更新      : PUT  /api/preoperative/<patientId>/
 */
export async function createPreoperative(data) {
  // data.basic_info, data.primary_tumor_info を含むオブジェクトを期待
  const payload = {
    basic_info: data.basic_info,
    primary_tumor_info: data.primary_tumor_info,
  };

  const res = await api.post('/api/preoperative/', payload);
  return res.data;
}

export async function updatePreoperative(patientId, data) {
  // 更新時は patientId を URL に含める
  const payload = {
    basic_info: data.basic_info,
    primary_tumor_info: data.primary_tumor_info,
  };

  const res = await api.put(`/api/preoperative/${patientId}/`, payload);
  return res.data;
}

/**
 * sendPreoperativeData は「patientId があれば update、なければ create」を自動で切り分けます
 */
export async function sendPreoperativeData(data, patientId = null) {
  if (patientId) {
    return await updatePreoperative(patientId, data);
  } else {
    return await createPreoperative(data);
  }
}

/**
 * ──────────── 術後フォーム ────────────
 *  ・新規登録: POST /api/postoperative/
 *  ・更新      : PUT  /api/postoperative/<patientId>/
 */
export async function createPostoperative(data) {
  const payload = {
    basic_info: data.basic_info,
    primary_tumor_info: data.primary_tumor_info,
    preoperative: data.preoperative,
  };

  const res = await api.post('/api/postoperative/', payload);
  return res.data;
}

export async function updatePostoperative(patientId, data) {
  const payload = {
    basic_info: data.basic_info,
    primary_tumor_info: data.primary_tumor_info,
    preoperative: data.preoperative,
  };

  const res = await api.put(`/api/postoperative/${patientId}/`, payload);
  return res.data;
}

export async function sendPostoperativeData(data, patientId) {
  if (patientId) {
    // patientId があれば PUT を呼ぶ
    const payload = {
      basic_info: data.basic_info,
      primary_tumor_info: data.primary_tumor_info,
      preoperative: data.preoperative,
    };
    const res = await api.put(`/api/postoperative/${patientId}/`, payload);
    return res.data;
  } else {
    // なければ POST
    const payload = {
      basic_info: data.basic_info,
      primary_tumor_info: data.primary_tumor_info,
      preoperative: data.preoperative,
    };
    const res = await api.post('/api/postoperative/', payload);
    return res.data;
  }
}

/**
 * ───────── 転移・再発フォーム ─────────
 *  ・新規登録: POST /api/metastatic/submit
 *  ・更新      : PUT  /api/metastatic/<patientId>/submit
 */
export async function createMetastatic(data) {
  const payload = {
    basic_info: data.basic_info,
    metastasis_info: data.metastasis_info,
  };

  // patientId が必要ない「新規登録用エンドポイント」は /api/metastatic/submit
  const res = await api.post('/api/metastatic/submit', payload);
  return res.data;
}

/**
 * sendPostProgressionData は「isUpdateMode=true かつ patientId があれば update、そうでなければ create」を切り分けます
 */
export async function sendPostProgressionData(data, isUpdateMode = false, patientId = null) {
  if (isUpdateMode && patientId) {
    return await updateMetastatic(patientId, data);
  } else {
    return await createMetastatic(data);
  }
}

export async function updateMetastatic(patientId, data) {
  const payload = {
    basic_info: data.basic_info,
    metastasis_info: data.metastasis_info,
  };

  // 更新用エンドポイントは /api/metastatic/<id>/submit
  const res = await api.put(`/api/metastatic/${patientId}/submit`, payload);
  return res.data;
}

/**
 * ───────── 保存済み患者データ取得 ─────────
 *  ・GET /api/patient/<patientId>/
 */
export async function fetchPatientData(patientId) {
  const res = await api.get(`/api/patient/${patientId}/`);
  return res.data;
}

/**
 * ───────── 術前・術後・転移すべてをまとめて取得 ─────────
 *  ※ /api/unified/<patientId>/ がバックエンドにある前提
 */
export async function fetchUnifiedPatientData(patientId) {
  const res = await api.get(`/api/unified/${patientId}/`);
  return res.data;
}

export default api;
