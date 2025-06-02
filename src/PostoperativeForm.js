  // PostoperativeForm.js 完全版
import React, { useState, useEffect } from 'react';
import {
  createPostoperative,
  updatePostoperative,
  fetchPatientData,
  fetchUnifiedPatientData, sendPostoperativeData   // ← 追加必須！
} from './api';
import BasicInfoPanel from './components/BasicInfoPanel';
import PrimaryTumorInfoPanel from './PrimaryTumorInfoPanel';
import PatientIdSearchPanel from './components/PatientIdSearchPanel';
import { interpretERStatus, interpretPgRStatus } from './utils/interpretMarker';
// import { saveDoubtCase } from './utils/saveDoubtCase';
import { saveDoubtCase } from './utils/saveDoubtCase'; // 使うなら残す
// import { loadPatientDataCommon } from './utils/loadPatientData'; // 今回は使わない想定

export default function PostoperativeForm({ patientId: initialPatientId }) {
  // ─── ① state 宣言 ──────────────────────────────────────────────────────
  const [patientId, setPatientId] = useState(initialPatientId || '');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [pastMedicalHistory, setPastMedicalHistory] = useState('');
  const [medications, setMedications] = useState('');
  const [familyHistory, setFamilyHistory] = useState([]);
  const [gbrca, setGbrca] = useState('');
  const [isPremenopausal, setIsPremenopausal] = useState(false);
  const [preTumorSize, setPreTumorSize] = useState('');
  const [preLymphEvaluation, setPreLymphEvaluation] = useState('');

  // PrimariTumorInfoPanel 用
  const [receivedNAC, setReceivedNAC] = useState(false);
  const [nacRegimen, setNacRegimen] = useState('');
  const [nacEndDate, setNacEndDate] = useState(''); 
  const [surgeryType, setSurgeryType] = useState('');
  const [axillarySurgery, setAxillarySurgery] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [primaryMarkers, setPrimaryMarkers] = useState({ ER: '', PgR: '', HER2: '', Ki67: '' });
  const [primaryPdL1, setPrimaryPdL1] = useState([]);
  const [tumorSize, setTumorSize] = useState('');
  const [invasionChestWall, setInvasionChestWall] = useState(false);
  const [invasionSkin, setInvasionSkin] = useState(false);
  const [inflammatory, setInflammatory] = useState(false);
  const [isYpTis, setIsYpTis] = useState(false);
  const [positiveNodes, setPositiveNodes] = useState('');
  const [marginStatus, setMarginStatus] = useState('');
  const [grade, setGrade] = useState('');
  const [useAllred, setUseAllred] = useState(false);
  const [erPercent, setErPercent] = useState('');
  const [pgrPercent, setPgrPercent] = useState('');
  const [erPS, setErPS] = useState('');
  const [erIS, setErIS] = useState('');
  const [pgrPS, setPgrPS] = useState('');
  const [pgrIS, setPgrIS] = useState('');

  // その他
  const [frailty, setFrailty] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [doubtComment, setDoubtComment] = useState('');
  const [formData, setFormData] = useState(null);

  // ─── ② useEffect で「ID変化 → データ取得 → 各 state にセット」 ─────────
  useEffect(() => {
    if (!patientId) return;

    // fetchUnifiedPatientData でも fetchPatientData でも OK
    fetchUnifiedPatientData(patientId)
      .then((data) => {
        handlePatientDataLoad(data);
        setDataLoaded(true);
      })
      .catch((err) => {
        console.error('患者データ取得エラー:', err);
        alert('患者データの取得に失敗しました');
      });
  }, [patientId]);

  // ─── ③ handlePatientDataLoad をすべて個別セットに書き直し ─────────────────
  const handlePatientDataLoad = (data) => {
    try {
      console.log('受信データ（術後）:', data);
      setIsUpdateMode(true);

      // ─── BasicInfo を個別セット ─────────────────
      const basic = data.basic_info || {};
      setBirthDate(basic.birth_date || '');
      setAge(basic.age?.toString() || '');
      setGender(basic.gender || '');
      setIsPremenopausal(basic.is_premenopausal || false);
      setPastMedicalHistory(basic.past_treatment || '');
      setMedications(basic.medications || '');
      setFamilyHistory(basic.family_history_list || []); // 形に合わせる
      setGbrca(basic.other_info?.gBRCA || '');

      // ─── PrimaryTumorInfo を個別セット ────────────
      const primary = data.primary_tumor_info || {};
      setReceivedNAC(primary.received_NAC || false);
      setNacRegimen(primary.NAC_regimen || '');
      setNacEndDate(primary.NAC_end_date || '');
      setSurgeryType(primary.surgery_type || '');
      setAxillarySurgery(primary.axillary_surgery || '');
      setSurgeryDate(primary.surgery_date || '');
      setPrimaryMarkers({
        ER: primary.ER || '',
        PgR: primary.PgR || '',
        HER2: primary.HER2 || '',
        Ki67: primary.Ki67?.toString() || '',
      });
      setPrimaryPdL1(primary.PD_L1 || []);
      setTumorSize(primary.tumor_size?.toString() || '');
      setInvasionChestWall(primary.chest_wall || false);
      setInvasionSkin(primary.skin || false);
      setInflammatory(primary.inflammatory || false);
      setIsYpTis(primary.is_ypTis || false);
      setPositiveNodes(primary.positive_nodes?.toString() || '');
      setMarginStatus(primary.margin_status || '');
      setGrade(primary.grade || '');
      setUseAllred(primary.use_allred || false);
      setErPercent(primary.er_percent?.toString() || '');
      setPgrPercent(primary.pgr_percent?.toString() || '');
      setErPS(primary.er_ps || '');
      setErIS(primary.er_is || '');
      setPgrPS(primary.pgr_ps || '');
      setPgrIS(primary.pgr_is || '');

      // … 必要な残りのフィールドがあれば同様に here で書く …
    } catch (error) {
      console.error('データ読み込みエラー（術後）:', error);
      alert('データ取得に失敗しました');
    }
  };

  // ─── ④ フォームリセット ────────────────────────────────────────────────
  const handleResetForm = () => {
    setRecommendation(null);
    setIsUpdateMode(false);
    setDataLoaded(false);
    setPatientId('');
    setBirthDate('');
    setAge('');
    setGender('');
    setIsPremenopausal(false);
    setPastMedicalHistory('');
    setMedications('');
    setFamilyHistory([]);
    setGbrca('');
    setPreTumorSize('');
    setPreLymphEvaluation('');
    setReceivedNAC(false);
    setNacRegimen('');
    setNacEndDate('');
    setSurgeryType('');
    setAxillarySurgery('');
    setSurgeryDate('');
    setPrimaryMarkers({ ER: '', PgR: '', HER2: '', Ki67: '' });
    setPrimaryPdL1([]);
    setTumorSize('');
    setInvasionChestWall(false);
    setInvasionSkin(false);
    setInflammatory(false);
    setIsYpTis(false);
    setPositiveNodes('');
    setMarginStatus('');
    setGrade('');
    setUseAllred(false);
    setErPercent('');
    setPgrPercent('');
    setErPS('');
    setErIS('');
    setPgrPS('');
    setPgrIS('');
    setFrailty(false);
  };

  // ─── ⑤ フォーム送信 ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    const ER = interpretERStatus({ useAllred, erPercent, erPS, erIS });
    const PgR = interpretPgRStatus({ useAllred, pgrPercent, pgrPS, pgrIS });

    const payload = {
      basic_info: {
        patient_id: patientId,
        birth_date: birthDate,
        age: parseInt(age || '0', 10),
        gender,
        is_premenopausal: isPremenopausal,
        past_treatment: pastMedicalHistory,
        medications,
        family_history: {
          breast: familyHistory.some((f) => f.disease === '乳がん'),
          ovary: familyHistory.some((f) => f.disease === '卵巣がん'),
          peritoneum: familyHistory.some((f) => f.disease === '腹膜がん'),
          pancreas: familyHistory.some((f) => f.disease === '膵臓がん'),
          others: familyHistory.some((f) => f.disease === 'その他'),
        },
        other_info: {
          gBRCA: gbrca,
          frailty: frailty,
          notes: '',
        },
      },
      primary_tumor_info: {
        received_NAC: receivedNAC,
        NAC_regimen: nacRegimen,
        NAC_end_date: nacEndDate,
        surgery_type: surgeryType,
        axillary_surgery: axillarySurgery,
        surgery_date: surgeryDate,
        ER,
        PgR,
        HER2: primaryMarkers.HER2,
        Ki67: parseInt(primaryMarkers.Ki67 || '0', 10),
        PD_L1: primaryPdL1,
        tumor_size: parseFloat(tumorSize || '0'),
        chest_wall: invasionChestWall,
        skin: invasionSkin,
        inflammatory,
        is_ypTis: isYpTis,
        positive_nodes: parseInt(positiveNodes || '0', 10),
        margin_status: marginStatus,
        grade,
      },
      systemic_treatments: [],
      interventions: [],
    };

    try {
      // 新規 or 更新 を自動的に振り分ける sendPostoperativeData を呼び出し
      const result = await sendPostoperativeData(payload, patientId);
      console.log('サーバー応答:', result);
      setRecommendation(result);
      setFormData(payload);
      setDataLoaded(true);
    } catch (error) {
      console.error(error);
      alert('通信エラー：' + error.message);
    }
  };


    return (  
      
      <form onSubmit={handleSubmit}>
        <h3>【術後情報入力】</h3>

        <PatientIdSearchPanel
          patientId={patientId}
          setPatientId={setPatientId}
          onSearch={(id) => setPatientId(id)}
          onReset={handleResetForm}
        />
                

        <BasicInfoPanel
      age={age} setAge={setAge}
      birthDate={birthDate} setBirthDate={setBirthDate}
      gender={gender} setGender={setGender}
      isPremenopausal={isPremenopausal} setIsPremenopausal={setIsPremenopausal}
      pastMedicalHistory={pastMedicalHistory} setPastMedicalHistory={setPastMedicalHistory}
      medications={medications} setMedications={setMedications}
      familyHistory={familyHistory} setFamilyHistory={setFamilyHistory}
      gbrca={gbrca} setGbrca={setGbrca}
      />
        
        <fieldset>
  <legend>術前情報（CPS+EGスコア用）</legend>

  <div>
    <label>術前腫瘍径（mm）:
      <input
        type="number"
        value={preTumorSize}
        onChange={(e) => setPreTumorSize(e.target.value)}
      /> mm
    </label>
  </div>

  <div>
    <label>術前リンパ節評価（cN）:
      {['cN0', 'cN1', 'cN2', 'cN3'].map((n) => (
        <label key={n}>
          <input
            type="radio"
            name="pre_cN"
            value={n}
            checked={preLymphEvaluation === n}
            onChange={(e) => setPreLymphEvaluation(e.target.value)}
          /> {n}
        </label>
      ))}
    </label>
  </div>
</fieldset>

        <PrimaryTumorInfoPanel
          receivedNAC={receivedNAC} setReceivedNAC={setReceivedNAC}
          nacRegimen={nacRegimen} setNacRegimen={setNacRegimen}
          nacEndDate={nacEndDate} setNacEndDate={setNacEndDate}
          surgeryType={surgeryType} setSurgeryType={setSurgeryType}
          axillarySurgery={axillarySurgery} setAxillarySurgery={setAxillarySurgery}
          surgeryDate={surgeryDate} setSurgeryDate={setSurgeryDate}
          primaryMarkers={primaryMarkers} setPrimaryMarkers={setPrimaryMarkers}
          primaryPdL1={primaryPdL1} setPrimaryPdL1={setPrimaryPdL1}
          tumorSize={tumorSize} setTumorSize={setTumorSize}
          invasionChestWall={invasionChestWall} setInvasionChestWall={setInvasionChestWall}
          invasionSkin={invasionSkin} setInvasionSkin={setInvasionSkin}
          inflammatory={inflammatory} setInflammatory={setInflammatory}
          isYpTis={isYpTis} setIsYpTis={setIsYpTis}
          positiveNodes={positiveNodes} setPositiveNodes={setPositiveNodes}
          marginStatus={marginStatus} setMarginStatus={setMarginStatus}
          grade={grade} setGrade={setGrade}
          erPercent={erPercent} setErPercent={setErPercent}
          pgrPercent={pgrPercent} setPgrPercent={setPgrPercent}
          useAllred={useAllred} setUseAllred={setUseAllred}
          erPS={erPS} setErPS={setErPS}
          erIS={erIS} setErIS={setErIS}
          pgrPS={pgrPS} setPgrPS={setPgrPS}
          pgrIS={pgrIS} setPgrIS={setPgrIS}
        />

        <fieldset>
          <legend>その他</legend>
        
          <label><input type="radio" name="frailty" value="true" onChange={() => setFrailty(true)} /> フレイルあり</label>
          <label><input type="radio" name="frailty" value="false" onChange={() => setFrailty(false)} checked={!frailty} /> フレイルなし</label>
        </fieldset>

        <button type="submit">送信</button>

        {recommendation && (
          <div>
            <h4>推奨治療結果</h4>
            <p><strong>IV Chemo推奨：</strong>{recommendation["IV Chemo"] || "なし"}</p>
            <p><strong>RTx：</strong>{recommendation["RTx"] || "なし"}</p>
            <p><strong>補助療法：</strong>{recommendation["補助療法"] || "なし"}</p>
            {recommendation["PMID"] && Array.isArray(recommendation["PMID"]) && (
              <p><strong>参考文献：</strong>{recommendation["PMID"].join(" / ")}</p>
            )}
            {recommendation["アラート"] && <p style={{ color: 'red' }}><strong>アラート：</strong>{recommendation["アラート"].join(' / ')}</p>}

            <div style={{ marginTop: '20px' }}>
              <label htmlFor="doubt-comment">💬 疑問に思った点を自由に記載：</label><br />
              <textarea
                id="doubt-comment"
                rows={4}
                cols={60}
                value={doubtComment}
                onChange={(e) => setDoubtComment(e.target.value)}
                placeholder="例：再発までの期間が短いのにホルモン療法だけになっているのが気になります…"
                style={{ marginTop: '8px', marginBottom: '12px', padding: '8px', borderRadius: '6px' }}
              />
              <br />
              <button
                onClick={() => saveDoubtCase("postoperative", formData, recommendation, doubtComment)}
                style={{ backgroundColor: '#f4c430', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
              >
                この症例を疑問症例として保存する
              </button>
            </div>
          </div>
        )}
      </form>
    );
  }

