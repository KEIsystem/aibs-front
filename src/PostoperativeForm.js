  // PostoperativeForm.js 完全版
  import React, { useState } from 'react';
  import { fetchUnifiedPatientData } from './api';
  import BasicInfoPanel from './components/BasicInfoPanel';
  import PrimaryTumorInfoPanel from './PrimaryTumorInfoPanel';
  import { interpretERStatus, interpretPgRStatus } from './utils/interpretMarker';
  import PatientIdSearchPanel from './components/PatientIdSearchPanel';
  import api from './api';
  import { sendPostoperativeData } from './api';
  import { saveDoubtCase } from './utils/saveDoubtCase';
  import { loadPatientDataCommon } from './utils/loadPatientData';

  function PostoperativeForm() {
    // 基本情報・既往・内服・家族歴
    const [patientId, setPatientId] = useState('');
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
   
    // PrimariTumorInfoPanel
    const [receivedNAC, setReceivedNAC] = useState(false);
    const [nacRegimen, setNacRegimen] = useState('');
    const [nacEndDate, setNacEndDate] = useState('');  // ← 追加
    const [surgeryType, setSurgeryType] = useState('');
    const [axillarySurgery, setAxillarySurgery] = useState('');
    const [surgeryDate, setSurgeryDate] = useState(''); // ← 追加
    const [primaryMarkers, setPrimaryMarkers] = useState({ ER: '', PgR: '', HER2: '', Ki67: '' }); // ← markers を置換
    const [primaryPdL1, setPrimaryPdL1] = useState([]); // ← PD-L1対応
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

    const [doubtComment, setDoubtComment] = useState("");
    const [formData, setFormData] = useState(null);

    const handlePatientDataLoad = async (data) => {
      try {
      console.log("受信データ（術後）:", data);
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

      // 術後特有の項目のセット
      const primary = data.primary || {};
      setReceivedNAC(primary.received_NAC || false);
      setNACRegimen(primary.NAC_regimen || '');
      setNACEndDate(primary.NAC_end_date || '');
      setSurgeryType(primary.surgery_type || '');
      setAxillarySurgery(primary.axillary_surgery || '');
      setSurgeryDate(primary.surgery_date || '');
      setPrimaryPdL1(primary.PD_L1 || '');
      setInvasionChestWall(primary.chest_wall || false);
      setInvasionSkin(primary.skin || false);
      setInflammatory(primary.inflammatory || false);
      setIsYpTis(primary.is_ypTis || false);
      setPositiveNodes(primary.positive_nodes?.toString() || '');
      setMarginStatus(primary.margin_status || '');

    } catch (error) {
      console.error("データ読み込みエラー（術後）:", error);
      alert("データ取得に失敗しました");
    }
  };


    const handleResetForm = () => {
          setRecommendation(null);
          setIsUpdateMode(false);
          setDataLoaded(false);

          // 基本情報・既往・内服・家族歴
          setBirthDate('');
          setAge('');
          setGender('');
          setIsPremenopausal(false);
          setPastMedicalHistory('');
          setMedications('');
          setFamilyHistory([]);
          setGbrca('');

          // 術前情報（CPS+EG用）
          setPreTumorSize('');
          setPreLymphEvaluation('');

          // PrimaryTumorInfoPanel 情報
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

          // その他
          setFrailty(false);
        };


    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log(" 送信ボタンがクリックされました");
    
      const ER = interpretERStatus({ useAllred, erPercent, erPS, erIS });
      const PgR = interpretPgRStatus({ useAllred, pgrPercent, pgrPS, pgrIS });
    
      // Djangoが求める構造に変換
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
            breast: familyHistory.some(f => f.disease === "乳がん"),
            ovary: familyHistory.some(f => f.disease === "卵巣がん"),
            peritoneum: familyHistory.some(f => f.disease === "腹膜がん"),
            pancreas: familyHistory.some(f => f.disease === "膵臓がん"),
            others: familyHistory.some(f => f.disease === "その他")
                  },
          other_info: {
            gBRCA: gbrca,
            frailty: frailty,
            notes: "",  // 必要なら備考も追加
          }
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

    
      console.log(" payload:", payload);
    
      console.log(" 送信前 payload 内容:", JSON.stringify(payload, null, 2));


      try {
        const json = await sendPostoperativeData(payload, true, patientId);  // 更新モードの場合


        console.log("サーバー応答:", json);
        setFormData(payload); // フォームデータを保存

        if (
          json.recommendation &&
          (json.recommendation["IV Chemo"] || json.recommendation["RTx"] || json.recommendation["補助療法"])
        ) {
          setRecommendation(json.recommendation);
        } else if (json.error) {
          alert("エラー：" + json.error);
        }

      } catch (error) {
        alert("通信エラー：" + error.message);
      }
    };

    return (  
      
      <form onSubmit={handleSubmit}>
        <h3>【術後情報入力】</h3>

        <PatientIdSearchPanel
          patientId={patientId}
          setPatientId={setPatientId}
          onSearch={fetchPatientData}
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

  export default PostoperativeForm;
