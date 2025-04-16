import React, { useEffect } from 'react';

function BasicInfoPanel({
  birthDate, setBirthDate,
  age, setAge,
  gender, setGender,
  isPremenopausal, setIsPremenopausal,
  pastMedicalHistory, setPastMedicalHistory,
  medications, setMedications,
  allergies, setAllergies,
  gbrca, setGbrca,
  familyHistory, setFamilyHistory
}) {
  // 年齢自動計算：生年月日が変わったら再計算
  useEffect(() => {
    if (birthDate) {
      const today = new Date();
      const birth = new Date(birthDate);
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      setAge(String(calculatedAge));
    }
  }, [birthDate, setAge]);

  return (
    <fieldset className="border p-3 rounded">
      <legend className="font-semibold">基本情報</legend>

      {/* 生年月日 → 年齢自動計算 */}
      <div className="flex flex-wrap items-center gap-x-6 mb-2">
        <label>
          生年月日：
          <input
            type="date"
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            className="ml-2 border px-2 py-1"
          />
        </label>

        <label className="ml-50">
           　年齢（自動計算）：
          <input
            type="number"
            value={age}
            disabled
            className="ml-2 border px-2 py-1 bg-gray-100 w-20"
          />
        </label>
      </div>

      {/* 性別 */}
      <div className="mb-4">
        <label>性別：</label>
        <label className="ml-2">
          <input
            type="radio"
            name="gender"
            value="女性"
            checked={gender === '女性'}
            onChange={() => setGender('女性')}
          /> 女性
        </label>
        <label className="ml-4">
          <input
            type="radio"
            name="gender"
            value="男性"
            checked={gender === '男性'}
            onChange={() => setGender('男性')}
          /> 男性
        </label>
        <div>
        <label>閉経状況：</label>
        <label>
          <input
            type="radio"
            name="is_premenopausal"
            value="true"
            checked={isPremenopausal === true}
            onChange={() => setIsPremenopausal(true)}
          />
          未閉経
        </label>
        <label>
          <input
            type="radio"
            name="is_premenopausal"
            value="false"
            checked={isPremenopausal === false}
            onChange={() => setIsPremenopausal(false)}
          />
          閉経済
        </label>
      </div>
      </div>

      {/* 既往歴・内服・アレルギー */}
      <div className="mb-4">
        <label className="block mb-1">既往歴：</label>
        <textarea
          className="w-full border p-1"
          value={pastMedicalHistory}
          onChange={e => setPastMedicalHistory(e.target.value)}
        />
        <label className="block mb-1 mt-2">　内服薬：</label>
        <textarea
          className="w-full border p-1"
          value={medications}
          onChange={e => setMedications(e.target.value)}
        />
        <label className="block mb-1 mt-2">　アレルギー：</label>
        <textarea
          className="w-full border p-1"
          value={allergies}
          onChange={e => setAllergies(e.target.value)}
        />
      </div>

      {/* 家族歴 */}
      <div className="mt-4">
        <h4 className="font-semibold mb-1">家族歴（該当するもの）</h4>
        {['乳がん', '卵巣がん', '腹膜がん', '膵臓がん'].map(disease => (
          <div key={disease} className="mb-1">
            <label>
              <input
                type="checkbox"
                checked={familyHistory.some(f => f.disease === disease)}
                onChange={e => {
                  const newHistory = [...familyHistory];
                  if (e.target.checked) {
                    newHistory.push({ disease, relation: '' });
                  } else {
                    const idx = newHistory.findIndex(f => f.disease === disease);
                    if (idx !== -1) newHistory.splice(idx, 1);
                  }
                  setFamilyHistory(newHistory);
                }}
              /> {disease}（続柄：
              <input
                type="text"
                className="ml-1 border px-1"
                value={familyHistory.find(f => f.disease === disease)?.relation || ''}
                onChange={e => {
                  const newHistory = familyHistory.map(f =>
                    f.disease === disease ? { ...f, relation: e.target.value } : f
                  );
                  setFamilyHistory(newHistory);
                }}
              />）
            </label>
          </div>
        ))}
        <div className="mt-2">
          <label>
            その他（自由記載）：
            <input
              type="text"
              className="ml-2 w-full border p-1"
              value={familyHistory.find(f => f.disease === 'その他')?.note || ''}
              onChange={e => {
                const otherIndex = familyHistory.findIndex(f => f.disease === 'その他');
                const newHistory = [...familyHistory];
                if (otherIndex !== -1) {
                  newHistory[otherIndex].note = e.target.value;
                } else {
                  newHistory.push({ disease: 'その他', note: e.target.value });
                }
                setFamilyHistory(newHistory);
              }}
            />
          </label>
        </div>
      </div>
         <br />       
      {/* gBRCA 検査結果 */}
      <div className="mt-4">
        <strong className="mr-2">BRACAnalysis 検査結果：</strong>
        {['未検査', 'BRCA1陽性', 'BRCA2陽性', 'VUS', '陰性'].map(option => (
          <label key={option} className="mr-4 inline-flex items-center">
            <input
              type="radio"
              name="gbrca"
              value={option}
              checked={gbrca === option}
              onChange={() => setGbrca(option)}
              className="mr-1"
            />
            {option}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default BasicInfoPanel;
