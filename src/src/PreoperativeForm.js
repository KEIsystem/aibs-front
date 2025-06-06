import React, { useState, useEffect } from 'react';
import BasicInfoPanel from './components/BasicInfoPanel';
import ERPgRInputPanel from './components/ERPgRInputPanel';
import { interpretERStatus, interpretPgRStatus } from './utils/interpretMarker';
import PatientIdSearchPanel from './components/PatientIdSearchPanel';
import api from "./api";

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

  const checkIfPatientExists = async (id) => {
    const url = `http://localhost:8000/api/patient/${id}/`;
    console.log("🔍 存在確認URL:", url);  // これを追加
    const res = await fetch(url);
    return res.ok;
  };

  useEffect(() => {
    console.log("recommendation state updated:", recommendation);
  }, [recommendation]);

  const handlePatientDataLoad = async (data) => {
    try {
      console.log("受信データ（API /api/patient/:id から）:", data);
  
      setIsUpdateMode(true);
  
      const basic = data.basic_info || {};
      setAge(basic.age?.toString() || '');
      setGender(basic.gender || '');
      setBirthDate(basic.birth_date || '');
      setIsPremenopausal(basic.is_premenopausal || false);
      setPastMedicalHistory(basic.past_treatment || '');
      setMedications(basic.medications || '');
      setAllergies(basic.allergies || '');
      setGbrca(basic.other_info?.gBRCA || '未検査');
  
      const fh = basic.family_history || {};
      const selected = [];
      if (fh.breast) selected.push("乳がん");
      if (fh.ovary) selected.push("卵巣がん");
      if (fh.peritoneum) selected.push("腹膜がん");
      if (fh.pancreas) selected.push("膵臓がん");
      if (fh.others) selected.push("その他");
      setFamilyHistory(selected);
  
      // その他情報
      setOtherInfo({
        frailty: basic.other_info?.frailty ?? null,
        notes: basic.other_info?.notes || '',
      });
  
      const details = data.primary || {};
      setSide(details.side || '');
      setRegions(details.regions || { A: false, B: false, C: false, D: false, E: false });
      setTumorSize(details.tumor_size?.toString() || '');
      setLymphEvaluation(details.lymph_evaluation || '');
      setHistology(details.histology || '');
      setIsInvasive(details.is_invasive || false);
      setGrade(details.grade || '');
  
      const mk = details.markers || {};
      setMarkers({
        ER: mk.ER || '',
        PgR: mk.PgR || '',
        HER2: mk.HER2 || '',
        Ki67: mk.Ki67?.toString() || '',
      });
  
      setUseAllred(false); // デフォルト false
      if (
        'er_percent' in mk || 'pgr_percent' in mk ||
        'er_ps' in mk || 'er_is' in mk || 'pgr_ps' in mk || 'pgr_is' in mk
      ) {
        setUseAllred(true);
        setErPercent(mk.er_percent?.toString() || '');
        setPgrPercent(mk.pgr_percent?.toString() || '');
        setErPS(mk.er_ps?.toString() || '');
        setErIS(mk.er_is?.toString() || '');
        setPgrPS(mk.pgr_ps?.toString() || '');
        setPgrIS(mk.pgr_is?.toString() || '');
      }
  
    } catch (error) {
      console.error("データ読み込み中にエラー発生:", error);
      alert("データ取得に失敗しました");
    }
  };
  

const fetchPatientData = async (id) => {
  try {
    const res = await fetch(`http://localhost:8000/api/patient/${id}/`);
    if (!res.ok) {
      const text = await res.text();
      console.error("非JSONレスポンス:", text);
      alert(`患者データの取得に失敗しました (HTTP ${res.status})`);
      return;
    }
    const json = await res.json();
    handlePatientDataLoad(json);
  } catch (err) {
    console.error("通信エラー:", err);
    alert("通信エラーが発生しました");
  }
};
  

  const handleRegionChange = (e) => {
    const { name, checked } = e.target;
    setRegions({ ...regions, [name]: checked });
  };

  const HER2_value = (() => {
    if (markers.HER2 === "0" || markers.HER2 === "1+" || markers.HER2 === "2+ (ISH陰性)") return "陰性";
    if (markers.HER2 === "2+ (ISH陽性)" || markers.HER2 === "3+") return "陽性";
    return "";
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const ER = interpretERStatus({ useAllred, erPercent, erPS, erIS });
    const PgR = interpretPgRStatus({ useAllred, pgrPercent, pgrPS, pgrIS });
  
    const interpretedMarkers = {
      ER,
      PgR,
      HER2: HER2_value,
      Ki67: parseInt(markers.Ki67 || '0', 10),
    };
  
    const hasDisease = (target) => familyHistory.includes(target);

    const payload = {
      ER: interpretedMarkers.ER,
      PgR: interpretedMarkers.PgR,
      HER2: markers.HER2 || null,
      tumor_size_mm: parseFloat(tumorSize || '0'),
      clinical_N: lymphEvaluation || null,
      age: parseInt(age || '0', 10),
      frail: otherInfo.frailty,
      radiation_history: pastMedicalHistory.includes("放射線"),
      gbrca_positive: gbrca === "陽性",
      gender: gender || null,
      family_history: {
        breast: hasDisease("乳がん"),   //  関数を使ってチェック
        ovary: hasDisease("卵巣がん"),
        peritoneum: hasDisease("腹膜がん"),
        pancreas: hasDisease("膵臓がん"),
        others: hasDisease("その他")
      },
      multifocal: Object.values(regions).filter(v => v).length > 1,
    };
  
    console.log("送信payload", payload);
    
    try {
      const res = await api.post("/api/patient/recommendation/preoperative/", payload);
      const json = res.data;
  
      if (json["サブタイプ"] || json["推奨"]) {
        setRecommendation(json); // ← json そのものを recommendation にする
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
       {recommendation && typeof recommendation === 'object' && (
  <div className="mt-6 border border-gray-300 p-4 rounded-md shadow">
    <h4 className="text-lg font-semibold mb-2">推奨治療結果</h4>

    {recommendation["サブタイプ"] && (
      <p><strong>サブタイプ：</strong>{recommendation["サブタイプ"]}</p>
    )}
    
    {recommendation["推奨"] && (
      <p><strong>推奨：</strong>{recommendation["推奨"]}</p>
    )}
    
    {recommendation["根拠"] && (
      <p><strong>根拠：</strong>{recommendation["根拠"]}</p>
    )}

    {recommendation["PMID"] && (
      <p><strong>参考文献：</strong>PMID: {recommendation["PMID"]}</p>
    )}

    {Array.isArray(recommendation["アラート"]) && recommendation["アラート"].length > 0 && (
      <div className="text-red-600 mt-2">
        <strong>アラート：</strong>
        <ul className="list-disc list-inside">
          {recommendation["アラート"].map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {/* ↓ デバッグ用：JSONで全体表示 */}
    <details className="mt-4 text-sm">
      <summary className="cursor-pointer text-blue-600">JSON形式で詳細を見る</summary>
      <pre className="bg-gray-100 p-2 mt-2 rounded text-gray-800">
        {JSON.stringify(recommendation, null, 2)}
      </pre>
    </details>
  </div>
)}

    </form>
  </>
);
}

export default PreoperativeForm;
