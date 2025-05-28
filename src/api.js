// aibs-front\src\api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

//
// ===== 術前フォーム送信 =====
export function sendPreoperativeData(data, patientId = null) {
  const payload = {
    patient_id: patientId,
    basic_info: data.basic_info,
    primary_tumor_info: data.primary_tumor_info
  };
  return api.post('/api/patient/', payload).then(res => res.data);
}

//
// 術後フォーム送信（保存 or 推論）
export function sendPostoperativeData(data, isUpdateMode = false, patientId = null) {
  const endpoint = isUpdateMode && patientId
    ? `/api/recommendation/postoperative/${patientId}/`
    : `/api/recommendation/postoperative/`;

  const method = isUpdateMode && patientId ? 'put' : 'post';

  const payload = {
    basic_info: data.basic_info,
    primary_tumor_info: data.primary_tumor_info,
    preoperative: data.preoperative
  };

  return api[method](endpoint, payload).then(res => res.data);
}

//
// ===== 転移・再発フォーム送信 =====
export function sendPostProgressionData(data, patientId = null) {
  const payload = {
    patient_id: patientId,
    basic_info: data.basic_info,
    metastasis_info: data.metastasis_info
  };
  return api.post('/api/patient/', payload).then(res => res.data);
}


//
// ===== 保存済み患者データの取得 =====
export function fetchPatientData(patientId) {
  return api.get(`/api/patient/${patientId}/`).then(res => res.data);
}

// 新しく追加（術前・術後・転移再発すべて取得）
export function fetchUnifiedPatientData(patientId) {
  return api.get(`/api/unified/${patientId}/`).then(res => res.data);
}

export default api;
