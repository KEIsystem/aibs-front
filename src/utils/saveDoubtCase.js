// src/utils/saveDoubtCase.js
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const saveDoubtCase = async (caseType, inputData, outputData, comment) => {
  try {
    await axios.post(`${BASE_URL}/api/doubtcase/save_doubt_case/`, {
      case_type: caseType,
      input_data: inputData,
      output_data: outputData,
      comment: comment || ""
    });
    alert('✅ 疑問症例として保存しました');
  } catch (error) {
    console.error('❌ 保存失敗:', error);
    alert('保存に失敗しました');
  }
};
