// PreoperativeForm.js
import React, { useState, useEffect } from 'react';
import BasicInfoPanel from './components/BasicInfoPanel';
import ERPgRInputPanel from './components/ERPgRInputPanel';
import PatientIdSearchPanel from './components/PatientIdSearchPanel';
import { interpretERStatus, interpretPgRStatus } from './utils/interpretMarker';
import { fetchUnifiedPatientData, sendPreoperativeData } from './api';
import { saveDoubtCase } from './utils/saveDoubtCase';
import { loadPatientDataCommon } from './utils/loadPatientData';

export default function PreoperativeForm() {
  // ─── ① フォーム用 state ───────────────────────────────────────────
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

  // 乳癌詳細
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

  // その他
  const [otherInfo, setOtherInfo] = useState({ frailty: null, notes: '' });
  const [recommendation, setRecommendation] = useState(null);

  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [formData, setFormData] = useState(null);
  const [doubtComment, setDoubtComment] = useState('');

  // ─── ② patientId が変わったら一度だけデータ取得 ────────────────────────
  useEffect(() => {
    if (!patientId) return;

    fetchUnifiedPatientData(patientId)
      .then((data) => {
        handlePatientDataLoad(data);
        setIsUpdateMode(true);
      })
      .catch((err) => {
        console.error('患者データ取得エラー:', err);
        alert('患者データの取得に失敗しました');
      });
  }, [patientId]);

  // ─── ③ 既存データを各 useState にセット ─────────────────────────────
  const handlePatientDataLoad = (data) => {
    try {
      console.log('受信データ:', data);

      // ── Basic Info をセット ──
      const basic = data.basic_info || {};
      setBirthDate(basic.birth_date || '');
      setAge(basic.age?.toString() || '');
      setGender(basic.gender || '');
      setIsPremenopausal(basic.is_premenopausal || false);
      setPastMedicalHistory(basic.past_treatment || '');
      setMedications(basic.medications || '');
      setAllergies(basic.allergies || '');
      setFamilyHistory(basic.family_history_list || []);
      setGbrca(basic.other_info?.gBRCA || '');

      // ── Primary Tumor Info をセット ──
      const primary = data.primary_tumor_info || {};
      setSide(primary.side || '');
      setRegions(primary.regions || { A: false, B: false, C: false, D: false, E: false });
      setTumorSize(primary.tumor_size?.toString() || '');
      setLymphEvaluation(primary.lymph_evaluation || '');
      setHistology(primary.histology || '');
      setIsInvasive(primary.is_invasive || false);
      setGrade(primary.grade || '');
      setMarkers({
        ER: primary.markers?.ER || '',
        PgR: primary.markers?.PgR || '',
        HER2: primary.markers?.HER2 || '',
        Ki67: primary.markers?.Ki67?.toString() || '',
      });
      setUseAllred(primary.use_allred || false);
      setErPercent(primary.er_percent?.toString() || '');
      setPgrPercent(primary.pgr_percent?.toString() || '');
      setErPS(primary.er_ps || '');
      setErIS(primary.er_is || '');
      setPgrPS(primary.pgr_ps || '');
      setPgrIS(primary.pgr_is || '');

      // ── Other Info をセット ──
      const other = basic.other_info || {};
      setOtherInfo({
        frailty: other.frailty ?? null,
        notes: other.notes || '',
      });

    } catch (err) {
      console.error('データ読込エラー:', err);
      alert('データ取得に失敗しました');
    }
  };

  // ─── ④ radio/checkbox のハンドラ ───────────────────────────────────
  const handleRegionChange = (e) => {
    const { name, checked } = e.target;
    setRegions((prev) => ({ ...prev, [name]: checked }));
  };

  // ─── ⑤ フォーム送信（Submit） ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ER/PgR の解釈
    const ER = interpretERStatus({ useAllred, erPercent, erPS, erIS });
    const PgR = interpretPgRStatus({ useAllred, pgrPercent, pgrPS, pgrIS });

    // フロントの state から最終 payload を組み立て
    const payload = {
      patient_id: patientId,
      basic_info: {
        age: parseInt(age || '0', 10),
        birth_date: birthDate,
        gender,
        is_premenopausal: isPremenopausal,
        past_treatment: pastMedicalHistory,
        medications,
        allergies,
        family_history: {
          // 例：API 側ではキー名がこうなっている想定
          breast: familyHistory.includes('breast'),
          ovary: familyHistory.includes('ovary'),
          peritoneum: familyHistory.includes('peritoneum'),
          pancreas: familyHistory.includes('pancreas'),
          others: familyHistory.includes('others'),
        },
        other_info: {
          gBRCA: gbrca,
          frailty: otherInfo.frailty,
          notes: otherInfo.notes || '',
        },
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
          ER,
          PgR,
          HER2: markers.HER2,
          Ki67: parseInt(markers.Ki67 || '0', 10),
        },
      },
    };

    // フォームデータを保存しておく（疑問症例として保存するときに参照するため）
    setFormData(payload);

    try {
      // sendPreoperativeData は patientId が空なら新規POST、なければ PUT で送る仕様
      const json = await sendPreoperativeData(payload, patientId);
      console.log('推論完了:', json);

      if (json.recommendation) {
        // レスポンスの中に recommendation キーがあれば画面表示用にセット
        setRecommendation(json.recommendation);
      } else if (json.error) {
        alert(`エラー：${json.error}`);
      }
    } catch (err) {
      console.error('送信エラー:', err);
      alert('送信中にエラーが発生しました');
    }
  };

  // ─── ⑥ JSX 部分 ──────────────────────────────────────────────────────
  return (
    <>
      {/* 患者検索パネル。onSearch で patientId をセットすると useEffect が動く */}
      <PatientIdSearchPanel
        patientId={patientId}
        setPatientId={setPatientId}
        onSearch={(id) => setPatientId(id)}
      />

      <form className="p-4" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4">術前情報入力</h2>

        {/* ── BasicInfoPanel ── */}
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

        {/* ── 乳癌の詳細 ── */}
        <fieldset className="mb-6">
          <legend className="font-semibold">乳癌の詳細</legend>

          <div className="mb-2">
            <label>側（Side）：
              <label className="ml-2">
                <input
                  type="radio"
                  name="side"
                  value="右"
                  checked={side === '右'}
                  onChange={(e) => setSide(e.target.value)}
                /> 右
              </label>
              <label className="ml-2">
                <input
                  type="radio"
                  name="side"
                  value="左"
                  checked={side === '左'}
                  onChange={(e) => setSide(e.target.value)}
                /> 左
              </label>
            </label>
          </div>

          <div className="mb-2">
            <label>区域（Regions）：
              {['A', 'B', 'C', 'D', 'E'].map((zone) => (
                <label key={zone} className="ml-2">
                  <input
                    type="checkbox"
                    name={zone}
                    checked={regions[zone]}
                    onChange={handleRegionChange}
                  /> {zone}
                </label>
              ))}
            </label>
          </div>

          <div className="mb-2">
            <label>腫瘍径（mm）：
              <input
                type="number"
                value={tumorSize}
                onChange={(e) => setTumorSize(e.target.value)}
                className="ml-2 border p-1"
              /> mm
            </label>
          </div>

          <div className="mb-2">
            <label>リンパ節評価（cN）：
              {['cN0', 'cN1', 'cN2', 'cN3'].map((n) => (
                <label key={n} className="ml-2">
                  <input
                    type="radio"
                    name="lymph"
                    value={n}
                    checked={lymphEvaluation === n}
                    onChange={(e) => setLymphEvaluation(e.target.value)}
                  /> {n}
                </label>
              ))}
            </label>
          </div>

          <div className="mb-2">
            <label>組織型（Histology）：
              <input
                type="text"
                value={histology}
                onChange={(e) => setHistology(e.target.value)}
                className="ml-2 border p-1"
              />
            </label>
          </div>

          <div className="mb-2">
            <label>
              <input
                type="checkbox"
                checked={isInvasive}
                onChange={(e) => setIsInvasive(e.target.checked)}
              /> 浸潤がんの場合チェック
            </label>
          </div>

          {isInvasive && (
            <>
              <div className="mb-2">
                <label>組織Grade：
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="ml-2 border p-1"
                  >
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

              <div className="mb-2">
                <label>マーカー（HER2）：
                  <select
                    value={markers.HER2}
                    onChange={(e) => setMarkers({ ...markers, HER2: e.target.value })}
                    className="ml-2 border p-1"
                  >
                    <option value="">選択してください</option>
                    <option value="0">0</option>
                    <option value="1+">1+</option>
                    <option value="2+ (ISH陰性)">2+（ISH陰性）</option>
                    <option value="2+ (ISH陽性)">2+（ISH陽性）</option>
                    <option value="3+">3+</option>
                  </select>
                </label>
              </div>

              <div className="mb-2">
                <label>マーカー（Ki-67）：
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={markers.Ki67}
                    onChange={(e) => setMarkers({ ...markers, Ki67: e.target.value })}
                    className="ml-2 border p-1"
                  /> %
                </label>
              </div>
            </>
          )}
        </fieldset>

        {/* ── その他 ── */}
        <fieldset className="mb-6">
          <legend className="font-semibold">その他</legend>
          <div className="mb-2">
            <label>フレイル状態：
              <label className="ml-2">
                <input
                  type="radio"
                  name="frailty"
                  value="true"
                  checked={otherInfo.frailty === true}
                  onChange={() => setOtherInfo({ ...otherInfo, frailty: true })}
                /> はい
              </label>
              <label className="ml-2">
                <input
                  type="radio"
                  name="frailty"
                  value="false"
                  checked={otherInfo.frailty === false}
                  onChange={() => setOtherInfo({ ...otherInfo, frailty: false })}
                /> いいえ
              </label>
            </label>
          </div>

          <div className="mb-2">
            <label>その他（自由記載）：
              <textarea
                value={otherInfo.notes}
                onChange={(e) => setOtherInfo({ ...otherInfo, notes: e.target.value })}
                className="ml-2 border p-1 w-full"
                rows={3}
              />
            </label>
          </div>
        </fieldset>

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          送信
        </button>

        {/* ── 推奨治療結果を受け取って表示 ── */}
        {recommendation && (
          <div className="mt-6 border border-gray-300 p-4">
            <h4 className="text-lg font-semibold mb-2">推奨治療結果</h4>
            {/* 以下はバックエンドが返すキーに合わせて適宜変更してください */}
            <p><strong>サブタイプ：</strong>{recommendation["サブタイプ"]}</p>
            <p><strong>推奨：</strong>{recommendation["推奨"]}</p>
            <p><strong>根拠：</strong>{recommendation["根拠"]}</p>
            {recommendation["PMID"] && (
              <p>
                <strong>参考文献：</strong>PMID: {recommendation["PMID"].join(" / ")}
              </p>
            )}
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
            {/* 疑問症例保存欄 */}
            <div className="mt-4">
              <label htmlFor="doubt-comment">💬 疑問に思った点を自由に記載：</label><br />
              <textarea
                id="doubt-comment"
                rows={4}
                cols={60}
                value={doubtComment}
                onChange={(e) => setDoubtComment(e.target.value)}
                placeholder="例：この症例でNACが推奨されない理由が不明です…"
                className="mt-2 p-2 border rounded w-full"
              />
              <br />
              <button
                onClick={() => saveDoubtCase("preoperative", formData, recommendation, doubtComment)}
                className="mt-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded"
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
