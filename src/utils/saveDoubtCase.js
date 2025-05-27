// src/utils/saveDoubtCase.js
import api from '../api';

export const saveDoubtCase = async (caseType, inputData, outputData, comment) => {
  try {
    await api.post('/api/doubtcase/save_doubt_case/', {
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
