  // PostoperativeForm.js 完全版
  import React, { useState } from 'react';
  import BasicInfoPanel from './components/BasicInfoPanel';
  import PrimaryTumorInfoPanel from './PrimaryTumorInfoPanel';
  import { interpretERStatus, interpretPgRStatus } from './utils/interpretMarker';
  import PatientIdSearchPanel from './components/PatientIdSearchPanel';



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

    const handlePatientDataLoad = (data) => {
      console.log("📥 検索結果（patient data）:", data);
      setIsUpdateMode(true);
    
      setAge(data.age || '');
      setBirthDate(data.birth_date || '');
      setGender(data.gender || '');
      setIsPremenopausal(data.is_premenopausal || false);
      setPastMedicalHistory(data.past_medical_history || '');
      setMedications(data.medications || '');
      setFamilyHistory(data.family_history || []);
      setGbrca(data.gbrca || '');
    
      setPreTumorSize(data.preoperative?.tumor_size_mm || '');
      setPreLymphEvaluation(data.preoperative?.clinical_N || '');
    
      const p = data.primary || {};
      setReceivedNAC(p.received_NAC || false);
      setNacRegimen(p.NAC_regimen || '');
      setNacEndDate(p.NAC_end_date || '');
      setSurgeryType(p.surgery_type || '');
      setAxillarySurgery(p.axillary_surgery || '');
      setSurgeryDate(p.surgery_date || '');
      setPrimaryMarkers({
        ER: p.ER || '',
        PgR: p.PgR || '',
        HER2: p.HER2 || '',
        Ki67: p.Ki67?.toString() || ''
      });
      setPrimaryPdL1(p.PD_L1 || []);
      setTumorSize(p.tumor_size || '');
      setInvasionChestWall(p.chest_wall || false);
      setInvasionSkin(p.skin || false);
      setInflammatory(p.inflammatory || false);
      setIsYpTis(p.is_ypTis || false);
      setPositiveNodes(p.positive_nodes || '');
      setMarginStatus(p.margin_status || '');
      setGrade(p.grade || '');
    
      const a = data.allred || {};
      setUseAllred(a.useAllred || false);
      setErPercent(a.er_percent || '');
      setPgrPercent(a.pgr_percent || '');
      setErPS(a.er_ps || '');
      setErIS(a.er_is || '');
      setPgrPS(a.pgr_ps || '');
      setPgrIS(a.pgr_is || '');
    
      setFrailty(data.frailty || false);
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log("🟢 送信ボタンがクリックされました");
    
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
            breast: familyHistory.includes("乳がん"),
            ovary: familyHistory.includes("卵巣がん"),
            pancreas: familyHistory.includes("膵がん"),
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
        adjuvant_therapy: null
      };
    
      console.log("📤 payload:", payload);
    
      const endpoint = 'http://localhost:8000/api/patient/recommendation/postoperative/';
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      console.log("✅ 送信前 payload 内容:", JSON.stringify(payload, null, 2));


      try {
        const res = await fetch("http://localhost:8000/api/patient/recommendation/postoperative/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });
    
        const json = await res.json();
        console.log("📥 サーバー応答:", json);
        console.log("🖥 表示する recommendation:", recommendation);
    
        if (
          json.recommendation &&
          (json.recommendation["IV Chemo"] || json.recommendation["RTx"] || json.recommendation["補助療法"])
        ) {
          setRecommendation(json.recommendation);  // ✅ これで recommendation がセットされる
          console.log("🖥 表示する recommendation:", json.recommendation);
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
          onPatientLoaded={handlePatientDataLoad}
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
          </div>
        )}
      </form>
    );
  }

  export default PostoperativeForm;
