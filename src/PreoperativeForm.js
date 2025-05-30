import React, { useState, useEffect } from 'react';
import BasicInfoPanel from './components/BasicInfoPanel';
import ERPgRInputPanel from './components/ERPgRInputPanel';
import { interpretERStatus, interpretPgRStatus } from './utils/interpretMarker';
import PatientIdSearchPanel from './components/PatientIdSearchPanel';
import api from './api';
import { saveDoubtCase } from './utils/saveDoubtCase';
import { fetchUnifiedPatientData, sendPreoperativeData } from './api';
import { loadPatientDataCommon } from './utils/loadPatientData';

function PreoperativeForm() {
  // 基本情報
  const [patientId, setPatientId] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [isPremenopausal, setIsPremenopausal] = useState(false);
  const [pastMedicalHistory, setPastMedicalHistory] = useState('');
  const [medications, setMedications] = useState('');
  const [familyHistory, setFamilyHistory] = useState([]);
  const [gbrca, setGbrca] = useState('未検査');
  const [allergies, setAllergies] = useState('');

  // 詳細情報
  const [side, setSide] = useState('');
  const [regions, setRegions] = useState({ A: false, B: false, C: false, D: false, E: false });
  const [tumorSize, setTumorSize] = useState('');
  const [lymphEvaluation, setLymphEvaluation] = useState('');
  const [histology, setHistology] = useState('');
  const [isInvasive, setIsInvasive] = useState(false);
  const [grade, setGrade] = useState('');
  const [markers, setMarkers] = useState({ ER: '', PgR: '', HER2: '', Ki67: '' });
  const [useAllred, setUseAllred] = useState(false);
  const [erPercent, setErPercent] = useState('');
  const [pgrPercent, setPgrPercent] = useState('');
  const [erPS, setErPS] = useState('');
  const [erIS, setErIS] = useState('');
  const [pgrPS, setPgrPS] = useState('');
  const [pgrIS, setPgrIS] = useState('');

  const [otherInfo, setOtherInfo] = useState({frailty: null, notes: '' });
  const [recommendation, setRecommendation] = useState(null);

  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [doubtComment, setDoubtComment] = useState('');
  const [formData, setFormData] = useState(null);

  const checkIfPatientExists = async (id) => {
    try {
      const res = await api.get(`/api/patient/${id}/`);
      return res.status === 200;
    } catch {
      return false;
    }
  };

  // recommendationが更新されたらログ出力
  useEffect(() => {
    console.log("recommendation state updated:", recommendation);
  }, [recommendation]);

  const handlePatientDataLoad = async (data) => {
    try {
      console.log("受信データ:", data);
      setIsUpdateMode(true);

      loadPatientDataCommon(data, {
        setGender,
        setBirthDate,
        setIsPremenopausal,
        setPastMedicalHistory,
        setMedications,
        setAllergies,
        setGbrca,
        setFamilyHistory,
        setOtherInfo,
        setSide,
        setRegions,
        setTumorSize,
        setLymphEvaluation,
        setHistology,
        setIsInvasive,
        setGrade,
        setMarkers,
        setUseAllred,
        setErPercent,
        setPgrPercent,
        setErPS,
        setErIS,
        setPgrPS,
        setPgrIS,
      });

    } catch (err) {
      console.error("データ読込エラー:", err);
      alert("データ取得に失敗しました");
    }
  };

  const fetchPatientData = async (id) => {
    try {
      const res = await api.get(`/api/patient/${id}/`);
      if (res.status !== 200) {
        alert(`患者データの取得に失敗しました (HTTP ${res.status})`);
        return;
      }
      const json = res.data;
      handlePatientDataLoad(json);
    } catch (err) {
      console.error("通信エラー:", err);
      alert("通信エラーが発生しました");
    }
  };
  

  const submitForm = async () => {
    const isNewPatient = !patientId || patientId.trim() === "";

    const formData = {
      ...(isNewPatient ? {} : { patient_id: patientId }),
      basic_info: {
        age,
        birth_date: birthDate,
        gender,
        is_premenopausal: isPremenopausal,
        past_treatment: pastMedicalHistory,
        medications,
        allergies,
        other_info: {
          gBRCA: gbrca,
          frailty
        },
        family_history: {
          breast: familyHistory.includes("breast"),
          ovary: familyHistory.includes("ovary"),
          peritoneum: familyHistory.includes("peritoneum"),
          pancreas: familyHistory.includes("pancreas"),
          others: familyHistory.includes("others")
        }
      },
      primary_tumor_info: {
        // 必要に応じて構築
      }
    };

    try {

      console.log("🧪 Final payload:", formData);
      // 保存処理（patient_idありの場合のみ）
      if (!isNewPatient) {
        await api.post('/api/patient/', formData);
        console.log("保存完了");
      } else {
        console.log("patient_idなし：保存スキップ");
      }

      // 推論処理（共通）
      const res = await api.post('/api/recommendation/preoperative/', formData);
      setRecommendation(res.data);  // 表示用にセット
      console.log("推論完了:", res.data);

    } catch (error) {
      console.error("送信エラー:", error);
      alert("送信中にエラーが発生しました");
    }
  };


  const handleRegionChange = (e) => {
    const { name, checked } = e.target;
    setRegions({ ...regions, [name]: checked });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const ER = interpretERStatus({ useAllred, erPercent, erPS, erIS });
    const PgR = interpretPgRStatus({ useAllred, pgrPercent, pgrPS, pgrIS });
  
    const interpretedMarkers = {
      ER,
      PgR,
      HER2: markers.HER2,
      Ki67: parseInt(markers.Ki67 || '0', 10),
    };
  
    const payload = {
      patient_id: patientId,
      basic_info: {
        age: parseInt(age || '0', 10),
        gender,
        is_premenopausal: isPremenopausal,
        past_treatment: pastMedicalHistory,
        medications,
        allergies,
        family_history: {
          breast: familyHistory.some(f => f.disease === "乳がん"),
          ovary: familyHistory.some(f => f.disease === "卵巣がん"),
          peritoneum: familyHistory.some(f => f.disease === "腹膜がん"),
          pancreas: familyHistory.some(f => f.disease === "膵臓がん"),
          others: familyHistory.some(f => f.disease === "その他")
                },
        other_info: {
          frailty: otherInfo.frailty,
          notes: otherInfo.notes,
          gBRCA: gbrca
        }
      },
      primary_tumor_info: {
        side,
        regions,
        tumor_size: parseFloat(tumorSize || '0'),
        lymph_evaluation: lymphEvaluation,
        histology,
        is_invasive: isInvasive,
        grade,
        markers: {
          ER: interpretedMarkers.ER,
          PgR: interpretedMarkers.PgR,
          HER2: interpretedMarkers.HER2,
          Ki67: interpretedMarkers.Ki67
        }
      }
    };

      setFormData(payload); // フォームデータを保存
    try {
      const json = await sendPreoperativeData(payload, patientId);  // ← ✅ ここ修正
      if (json.recommendation) {
        setRecommendation(json.recommendation);
      } else if (json.error) {
        alert(`エラー：${json.error}`);
      }
    } catch (error) {
      alert("通信エラー：" + error.message);
    }
  };

  return (
    <>
      <PatientIdSearchPanel
        patientId={patientId}
        setPatientId={setPatientId}
        onSearch={fetchPatientData}
      />

    <form className="p-4" onSubmit={handleSubmit} action="#">
      <h2 className="text-2xl font-bold mb-4">術前情報入力</h2>

      <BasicInfoPanel
        birthDate={birthDate} setBirthDate={setBirthDate}
        age={age} setAge={setAge}
        gender={gender} setGender={setGender}
        isPremenopausal={isPremenopausal} setIsPremenopausal={setIsPremenopausal}
        pastMedicalHistory={pastMedicalHistory} setPastMedicalHistory={setPastMedicalHistory}
        medications={medications} setMedications={setMedications}
        allergies={allergies} setAllergies={setAllergies}
        familyHistory={familyHistory} setFamilyHistory={setFamilyHistory}
        gbrca={gbrca} setGbrca={setGbrca}
      />

      {/* 乳癌の詳細 */}
      <fieldset className="mb-6">
        <legend className="font-semibold">乳癌の詳細</legend>
        <div>
          <label>領域:
            <label><input type="radio" name="side" value="右" checked={side === '右'} onChange={(e) => setSide(e.target.value)} /> 右</label>
            <label><input type="radio" name="side" value="左" checked={side === '左'} onChange={(e) => setSide(e.target.value)} /> 左</label>
          </label>
        </div>
        <div>
          <label>区域:
            {['A', 'B', 'C', 'D', 'E'].map((zone) => (
              <label key={zone}>
                <input type="checkbox" name={zone} checked={regions[zone]} onChange={handleRegionChange} /> {zone}
              </label>
            ))}
          </label>
        </div>
        <div>
          <label>腫瘍径： <input type="number" value={tumorSize} onChange={(e) => setTumorSize(e.target.value)} /> mm</label>
        </div>
        <div>
          <label>リンパ節評価:
            {['cN0', 'cN1', 'cN2', 'cN3'].map((n) => (
              <label key={n}>
                <input type="radio" name="lymph" value={n} checked={lymphEvaluation === n} onChange={(e) => setLymphEvaluation(e.target.value)} /> {n}
              </label>
            ))}
          </label>
        </div>
        <div>
          <label>組織型:
            <input type="text" value={histology} onChange={(e) => setHistology(e.target.value)} />
          </label>
        </div>
        <div>
          <label>浸潤がんの場合:
            <input type="checkbox" checked={isInvasive} onChange={(e) => setIsInvasive(e.target.checked)} />
          </label>
        </div>
        {isInvasive && (
          <>
            <div>
              <label>組織Grade:
                <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                  <option value="">選択してください</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                </select>
              </label>
            </div>

            <ERPgRInputPanel
              useAllred={useAllred} setUseAllred={setUseAllred}
              erPercent={erPercent} setErPercent={setErPercent}
              pgrPercent={pgrPercent} setPgrPercent={setPgrPercent}
              erPS={erPS} setErPS={setErPS}
              erIS={erIS} setErIS={setErIS}
              pgrPS={pgrPS} setPgrPS={setPgrPS}
              pgrIS={pgrIS} setPgrIS={setPgrIS}
            />
            <div>
              <label>マーカー（HER2）:
                <select value={markers.HER2} onChange={(e) => setMarkers({ ...markers, HER2: e.target.value })}>
                  <option value="">選択してください</option>
                  <option value="0">0</option>
                  <option value="1+">1+</option>
                  <option value="2+ (ISH陰性)">2+（ISH陰性）</option>
                  <option value="2+ (ISH陽性)">2+（ISH陽性）</option>
                  <option value="3+">3+</option>
                </select>
              </label>
            </div>
            <div>
              <label>マーカー（Ki-67）:
                <input type="number" min="0" max="100" value={markers.Ki67} onChange={(e) => setMarkers({ ...markers, Ki67: e.target.value })} /> %
              </label>
            </div>
          </>
        )}
      </fieldset>

      {/* その他 */}
      <fieldset className="mb-6">
        <legend className="font-semibold">その他</legend>
        <div>
         
        </div>
        <div>
          <label>フレイル状態:
            <label><input type="radio" name="frailty" value="true" checked={otherInfo.frailty === true} onChange={() => setOtherInfo({ ...otherInfo, frailty: true })} /> はい</label>
            <label><input type="radio" name="frailty" value="false" checked={otherInfo.frailty === false} onChange={() => setOtherInfo({ ...otherInfo, frailty: false })} /> いいえ</label>
          </label>
        </div>
        <div>
          <label>その他（自由記載）:
            <textarea value={otherInfo.notes} onChange={(e) => setOtherInfo({ ...otherInfo, notes: e.target.value })} />
          </label>
        </div>
      </fieldset>

      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
        送信
      </button>

       {/* 推奨治療結果の表示 */}
       {recommendation && (
          <div className="mt-6 border border-gray-300 p-4">
            <h4 className="text-lg font-semibold mb-2">推奨治療結果</h4>
            <p><strong>サブタイプ：</strong>{recommendation["サブタイプ"]}</p>
            <p><strong>推奨：</strong>{recommendation["推奨"]}</p>
            <p><strong>根拠：</strong>{recommendation["根拠"]}</p>
            {recommendation["PMID"] && <p><strong>参考文献：</strong>PMID: {recommendation["PMID"]}</p>}
            
            {recommendation["アラート"] && (
              <div className="text-red-600">
                <strong>アラート：</strong>
                <ul className="list-disc list-inside">
                  {recommendation["アラート"].map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ✅ 疑問症例の自由記載欄（アラートの有無にかかわらず表示） */}
            <div style={{ marginTop: '20px' }}>
              <label htmlFor="doubt-comment">💬 疑問に思った点を自由に記載：</label><br />
              <textarea
                id="doubt-comment"
                rows={4}
                cols={60}
                value={doubtComment}
                onChange={(e) => setDoubtComment(e.target.value)}
                placeholder="例：この症例でNACが推奨されない理由が不明です…"
                style={{ marginTop: '8px', marginBottom: '12px', padding: '8px', borderRadius: '6px' }}
              />
              <br />
              <button
                onClick={() => saveDoubtCase("preoperative", formData, recommendation, doubtComment)}
                style={{ backgroundColor: '#f4c430', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                この症例を疑問症例として保存する
              </button>
            </div>
          </div>
        )}
      

      
    </form>
  </>
);
}

export default PreoperativeForm;
