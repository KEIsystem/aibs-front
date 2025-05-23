import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

//
// ===== 術前フォーム =====
export function sendPreoperativeData(data, isUpdate = false, patientId = null) {
  const method = isUpdate ? 'put' : 'post';
  const url = isUpdate && patientId
    ? `/api/preoperative/${patientId}/edit/`
    : `/api/preoperative/`;
  return api({ method, url, data }).then(res => res.data);
}

//
// ===== 術後フォーム =====
export function sendPostoperativeData(data, isUpdate = false, patientId = null) {
  const method = isUpdate ? 'put' : 'post';
  const url = isUpdate && patientId
    ? `/api/postoperative/${patientId}/`
    : `/api/postoperative/`;
  return api({ method, url, data }).then(res => res.data);
}

//
// ===== 転移・再発（PostPD）フォーム =====
export function sendPostProgressionData(data, isUpdate = false, patientId = "") {
  const method = isUpdate ? 'put' : 'post';
  const url =
    (!patientId || patientId.trim() === "")
      ? '/api/metastatic/submit'  // 保存なし → patient_idなし
      : `/api/metastatic/submit/${patientId}`;  // 保存あり

  return api({ method, url, data }).then(res => res.data);
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
