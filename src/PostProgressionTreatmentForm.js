// PostProgressionTreatmentForm.js 完全統合版 with 原発治療パネル
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle
} from 'react';
import { fetchUnifiedPatientData } from './api';
import PrimaryTumorInfoPanel from './PrimaryTumorInfoPanel';
import AdjuvantTreatmentPanel from './AdjuvantTreatmentPanel';
import BasicInfoPanel from './components/BasicInfoPanel';
import ERPgRInputPanel from './components/ERPgRInputPanel';
import { interpretERStatus, interpretPgRStatus } from './utils/interpretMarker';
import PatientIdSearchPanel from './components/PatientIdSearchPanel';
import api from './api';
import { sendPostProgressionData } from './api';
import FoundationOnePanel from './components/FoundationOnePanel';

const drugCategories = {
  luminal: ['TAM', 'ANA', 'LET', 'EXE', 'Ful', 'LH-RHa', 'Palbo', 'Abema', 'Ful+Capi', 'EXE+EVE', 'MPA'],
  her2: ['Tmab', 'Pmab', 'T-DXd', 'T-DM1', 'Lapatinib'],
  oralChemo: ['TS-1', 'Cape', 'UFT', 'CPA', 'MTX'],
  targeted: ['Olaparib', 'Talazoparib', 'Atezolizumab', 'Pembrolizumab', 'Bev','SG', 'Dmab', 'Dato-Dxd'],
  ivChemo: ['Doxorubicin', 'Epirubicin', 'DTx', 'PTx', 'nab-PTX', 'CBDCA', 'Eribulin', 'GEM', 'VNR'],
};

function PostProgressionTreatmentForm() {
  const [patientId, setPatientId] = useState('');
  const [dataLoaded, setDataLoaded] = useState(false);
  const [age, setAge] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [isPremenopausal, setIsPremenopausal] = useState(false);
  const [pastMedicalHistory, setPastMedicalHistory] = useState('');
  const [medications, setMedications] = useState('');
  const [allergies, setAllergies] = useState('');
  const [gbrca, setGbrca] = useState('未検査');
  const [familyHistory, setFamilyHistory] = useState([]);
  const [preTumorSize, setPreTumorSize] = useState('');
  const [preLymphEvaluation, setPreLymphEvaluation] = useState('');
  const [frailty, setFrailty] = useState(false);

  const [isDeNovo, setIsDeNovo] = useState(false);

  const [treatments, setTreatments] = useState([
    {
      treatmentLineId: 1,
      startDate: '',
      endDate: '',
      drugs: [],
      outcome: '',
      metastasisSites: {
        local: false, local_ln: false, distant_ln: false,
        lung: false, liver: false, bone: false, brain: false, other: false
      },
      otherSiteDetail: ''
    }
  ]);

  const [receivedNAC, setReceivedNAC] = useState(false);
  const [nacRegimen, setNacRegimen] = useState('');
  const [nacEndDate, setNacEndDate] = useState('');
  const [surgeryType, setSurgeryType] = useState('');
  const [axillarySurgery, setAxillarySurgery] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [primaryMarkers, setPrimaryMarkers] = useState({ ER: '', PgR: '', HER2: '', Ki67: '' });
  const [primaryPdL1, setPrimaryPdL1] = useState({sp142: 'none', cps: 'none', msi: 'none', mmr: 'none'});
  const [tumorSize, setTumorSize] = useState('');
  const [invasionChestWall, setInvasionChestWall] = useState(false);
  const [invasionSkin, setInvasionSkin] = useState(false);
  const [inflammatory, setInflammatory] = useState(false);
  const [isYpTis, setIsYpTis] = useState(false);
  const [positiveNodes, setPositiveNodes] = useState('');
  const [marginStatus, setMarginStatus] = useState('');
  const [grade, setGrade] = useState('');
  const [anthraResponse, setAnthraResponse] = useState("未治療");
  const [taxaneResponse, setTaxaneResponse] = useState("未治療");

  const [recurrenceMarkers, setRecurrenceMarkers] = useState({ ER: '', PgR: '', HER2: '', Ki67: '' });
  const [copyPrimaryToRecurrence, setCopyPrimaryToRecurrence] = useState(false);
  const [recurrenceBiopsy, setRecurrenceBiopsy] = useState(false);
  const [recurrenceBiopsySite, setRecurrenceBiopsySite] = useState('');
  const [metastasisSites, setMetastasisSites] = useState({
    local: false, local_ln: false, distant_ln: false,
    lung: false, liver: false, bone: false, brain: false, other: false
  });
  const [otherSiteDetail, setOtherSiteDetail] = useState('');
  const [useAllred, setUseAllred] = useState(false);
  const [erPercent, setErPercent] = useState('');
  const [pgrPercent, setPgrPercent] = useState('');
  const [erPS, setErPS] = useState('');
  const [erIS, setErIS] = useState('');
  const [pgrPS, setPgrPS] = useState('');
  const [pgrIS, setPgrIS] = useState('');
  const [sp142, setSp142] = useState('none');
  const [cps, setCps] = useState('none');
  const [msi, setMsi] = useState('none');
  const [mmr, setMmr] = useState('none');

  const [foundationStatus, setFoundationStatus] = useState("未検査");
  const [foundationDate, setFoundationDate] = useState("");
  const [foundationComment, setFoundationComment] = useState("");

  const [recurrenceDate, setRecurrenceDate] = useState('');
  const [localTherapy, setLocalTherapy] = useState({
    surgery: false, surgery_date: '', surgery_note: '',
    radiation: false, radiation_date: '', radiation_note: ''
  });

  const [interventions, setInterventions] = useState([
    {
      biopsy: false,
      biopsy_site: '',
      biopsy_date: '',
      markers: { ER: '', PgR: '', HER2: '', Ki67: '' },
      useAllred: false,
      erPercent: '',
      pgrPercent: '',
      erPS: '',
      erIS: '',
      pgrPS: '',
      pgrIS: '',
      surgery: false,
      surgery_date: '',
      surgery_note: '',
      radiation: false,
      radiation_date: '',
      radiation_note: ''
    }
  ]);
  const adjuvantRef = useRef();
  const [visceralCrisis, setVisceralCrisis] = useState(false);
  const [recurrenceBiopsyDate, setRecurrenceBiopsyDate] = useState('');
  const [result, setResult] = useState(null);
  const [isDeceased, setIsDeceased] = useState(false);
  const [dateOfDeath, setDateOfDeath] = useState('');
  const [causeOfDeath, setCauseOfDeath] = useState('');

  const [isUpdateMode, setIsUpdateMode] = useState(false);

    useEffect(() => {
    if (isUpdateMode && dataLoaded) {
      console.log(" useEffectによる初期化処理");
      setResult(null);  // 推奨治療の結果をリセット
    }
  }, [isUpdateMode, dataLoaded]);

  const resetForm = () => {
    setAge('');
    setBirthDate('');
    setGender('');
    setIsPremenopausal(false);
    setPastMedicalHistory('');
    setMedications('');
    setAllergies('');
    setGbrca('未検査');
    setFamilyHistory([]);

    setPreTumorSize('');
    setPreLymphEvaluation('');
    setFrailty(false);

    setReceivedNAC(false);
    setNacRegimen('');
    setNacEndDate('');
    setSurgeryType('');
    setAxillarySurgery('');
    setSurgeryDate('');
    setPrimaryMarkers({ ER: '', PgR: '', HER2: '', Ki67: '' });
    setPrimaryPdL1({ sp142: 'none', cps: 'none', msi: 'none', mmr: 'none' });
    setTumorSize('');
    setInvasionChestWall(false);
    setInvasionSkin(false);
    setInflammatory(false);
    setIsYpTis(false);
    setPositiveNodes('');
    setMarginStatus('');
    setGrade('');
    setAnthraResponse('未治療');
    setTaxaneResponse('未治療');

    setUseAllred(false);
    setErPercent('');
    setPgrPercent('');
    setErPS('');
    setErIS('');
    setPgrPS('');
    setPgrIS('');

    setRecurrenceMarkers({ ER: '', PgR: '', HER2: '', Ki67: '' });
    setRecurrenceBiopsy(false);
    setRecurrenceBiopsySite('');
    setRecurrenceBiopsyDate('');
    setMetastasisSites({
      local: false, local_ln: false, distant_ln: false,
      lung: false, liver: false, bone: false, brain: false, other: false
    });
    setOtherSiteDetail('');

    setRecurrenceDate('');
    setLocalTherapy({
      surgery: false, surgery_date: '', surgery_note: '',
      radiation: false, radiation_date: '', radiation_note: ''
    });

    setTreatments([{
      treatmentLineId: 1,
      startDate: '',
      endDate: '',
      drugs: [],
      outcome: '',
      metastasisSites: {
        local: false, local_ln: false, distant_ln: false,
        lung: false, liver: false, bone: false, brain: false, other: false
      },
      otherSiteDetail: ''
    }]);

    
    setIsDeNovo(false);
    setVisceralCrisis(false);
    setIsDeceased(false);
    setDateOfDeath('');
    setCauseOfDeath('');
    setResult(null);
    setCopyPrimaryToRecurrence(false);
  };


  const handlePatientDataLoad = (data) => {
    console.log("📥 検索結果（patient data）:", data);
    
    resetForm();
    setIsUpdateMode(true);
    setDataLoaded(true);

    setBirthDate(data.birth_date || '');
    setGender(data.gender || '');
    setIsPremenopausal(data.is_premenopausal || false);
    setPastMedicalHistory(data.past_medical_history || '');
    setMedications(data.medications || '');
    setAllergies(data.allergies || '');
    setGbrca(data.gbrca || '未検査');
    setFamilyHistory(data.family_history || []);
  
    setPreTumorSize(data.preoperative?.tumor_size_mm || '');
    setPreLymphEvaluation(data.preoperative?.clinical_N || '');
  
    const p = data.primary || {};
    setReceivedNAC(data.primary?.received_NAC || false);
    setNacRegimen(data.primary?.NAC_regimen || '');
    setNacEndDate(data.primary?.NAC_end_date || '');
    setSurgeryType(data.primary?.surgery_type || '');
    setAxillarySurgery(data.primary?.axillary_surgery || '');
    setSurgeryDate(data.primary?.surgery_date || '');
    setPrimaryMarkers({
      ER: data.primary?.ER || '',
      PgR: data.primary?.PgR || '',
      HER2: data.primary?.HER2 || '',
      Ki67: data.primary?.Ki67?.toString() || ''
    });
    setPrimaryPdL1(data.primary?.PD_L1 || { sp142: 'none', cps: 'none', msi: 'none', mmr: 'none' });
    setTumorSize(data.primary?.tumor_size || '');
    setInvasionChestWall(data.primary?.chest_wall || false);
    setInvasionSkin(data.primary?.skin || false);
    setInflammatory(data.primary?.inflammatory || false);
    setIsYpTis(data.primary?.is_ypTis || false);
    setPositiveNodes(data.primary?.positive_nodes || '');
    setMarginStatus(data.primary?.margin_status || '');
    setGrade(data.primary?.grade || '');

    setAnthraResponse(data.primary?.anthra_response || '未治療');
    setTaxaneResponse(data.primary?.taxane_response || '未治療');

    const a = data.allred || {};
    setUseAllred(a.useAllred || false);
    setErPercent(a.er_percent || '');
    setPgrPercent(a.pgr_percent || '');
    setErPS(a.er_ps || '');
    setErIS(a.er_is || '');
    setPgrPS(a.pgr_ps || '');
    setPgrIS(a.pgr_is || '');
  
    setFrailty(data.frailty || false);

    const recurrence = data.recurrence || {};
    setRecurrenceBiopsy(recurrence.biopsy || false);
    setRecurrenceBiopsySite(recurrence.biopsy_site || '');
    setRecurrenceBiopsyDate(recurrence.biopsy_date || '');
    setMetastasisSites(recurrence.sites || {});
    setOtherSiteDetail(recurrence.other_site_detail || '');
    setRecurrenceMarkers({
      ER: recurrence.markers?.ER || '',
      PgR: recurrence.markers?.PgR || '',
      HER2: recurrence.markers?.HER2 || '',
      Ki67: recurrence.markers?.Ki67?.toString() || ''
    });
    setRecurrenceBiopsySite(data.recurrence?.biopsy_site || '');
    setRecurrenceBiopsyDate(data.recurrence?.biopsy_date || '');
    setMetastasisSites(data.recurrence?.sites || {});
    setOtherSiteDetail(data.recurrence?.other_site_detail || '');
    setRecurrenceMarkers({
      ER: data.recurrence?.markers?.ER || '',
      PgR: data.recurrence?.markers?.PgR || '',
      HER2: data.recurrence?.markers?.HER2 || '',
      Ki67: data.recurrence?.markers?.Ki67?.toString() || ''});

      setTreatments(data.systemic_treatments?.length > 0 ? data.systemic_treatments : [
        {
          treatmentLineId: 1,
          startDate: '',
          endDate: '',
          drugs: [],
          outcome: '',
          metastasisSites: {
            local: false,
            local_ln: false,
            distant_ln: false,
            lung: false,
            liver: false,
            bone: false,
            brain: false,
            other: false
          },
          otherSiteDetail: ''
        }
      ]);
    setInterventions(data.interventions || []);

    setLocalTherapy(data.local_therapy || {
        surgery: false,
        surgery_date: '',
        surgery_note: '',
        radiation: false,
        radiation_date: '',
        radiation_note: '',
    });

    setIsDeNovo(data.is_de_novo || false);
    setVisceralCrisis(data.visceral_crisis || false);

    setIsDeceased(data.is_deceased || false);
    setDateOfDeath(data.date_of_death || '');
    setCauseOfDeath(data.cause_of_death || '');
  };



  const handleOutcomeChange = (index, value) => {
    const updated = [...treatments];
    updated[index].outcome = value;

    if (value === "PD") {
      updated[index].metastasisSites = {
        local: false, local_ln: false, distant_ln: false,
        lung: false, liver: false, bone: false, brain: false, other: false
      };
      updated[index].otherSiteDetail = '';
    } else {
      delete updated[index].metastasisSites;
      delete updated[index].otherSiteDetail;
    }

    setTreatments(updated);
  };

  const handleDrugChange = (lineId, drug) => {
    setTreatments(prev =>
      prev.map(t =>
        t.treatmentLineId === lineId
          ? {
              ...t,
              drugs: t.drugs.includes(drug)
                ? t.drugs.filter(d => d !== drug)
                : [...t.drugs, drug]
            }
          : t
      )
    );
  };

  const handleAddTreatmentLine = () => {
    const nextTreatmentLineId = treatments.length + 1;
    setTreatments([...treatments,
      {
        treatmentLineId: nextTreatmentLineId,
        startDate: '',
        endDate: '',
        drugs: [],
        outcome: '',
        metastasisSites: {
          local: false, local_ln: false, distant_ln: false,
          lung: false, liver: false, bone: false, brain: false, other: false
        },
        otherSiteDetail: ''
      }
    ]);
    setInterventions([...interventions, {
      biopsy: false,
      biopsy_site: '',
      biopsy_date: '',
      markers: { ER: '', PgR: '', HER2: '', Ki67: '', sp142: 'none',
      cps: 'none',
      msi: 'none',
      mmr: 'none' },
      useAllred: false,
      erPercent: '',
      pgrPercent: '',
      erPS: '',
      erIS: '',
      pgrPS: '',
      pgrIS: '',
      surgery: false,
      surgery_date: '',
      surgery_note: '',
      radiation: false,
      radiation_date: '',
      radiation_note: ''
    }]);
  };

  const handleCopyPrimaryMarkers = () => {
    setRecurrenceMarkers({ ...primaryMarkers });
    setUseAllred(useAllred); // そのままコピー
    setErPercent(erPercent);
    setPgrPercent(pgrPercent);
    setErPS(erPS);
    setErIS(erIS);
    setPgrPS(pgrPS);
    setPgrIS(pgrIS);
    setSp142(primaryPdL1.sp142 || 'none');
    setCps(primaryPdL1.cps || 'none');
    setMsi(primaryPdL1.msi || 'none');
    setMmr(primaryPdL1.mmr || 'none');
  };
 

  const handleSubmit = async () => {
    const adjuvantData = adjuvantRef.current?.getAdjuvantData?.();
    const method = isUpdateMode ? 'PUT' : 'POST';
    const endpoint = `${process.env.REACT_APP_API_BASE_URL}/api/metastatic/submit`;

    const ER = interpretERStatus({ useAllred, erPercent, erPS, erIS });
    const PgR = interpretPgRStatus({ useAllred, pgrPercent, pgrPS, pgrIS });

    const formData = {
      patient_id: patientId,
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
          frailty: frailty,
        },
        family_history: {
          breast: familyHistory.some(f => f.disease === "乳がん"),
          ovary: familyHistory.some(f => f.disease === "卵巣がん"),
          peritoneum: familyHistory.some(f => f.disease === "腹膜がん"),
          pancreas: familyHistory.some(f => f.disease === "膵臓がん"),
          others: familyHistory.some(f => f.disease === "その他")
        },
      },
      is_de_novo: isDeNovo,
      visceral_crisis: visceralCrisis,
      primary_tumor_info: {
        received_NAC: receivedNAC,
        NAC_regimen: nacRegimen,
        NAC_end_date: nacEndDate,
        anthra_response: anthraResponse,
        taxane_response: taxaneResponse,
        surgery_type: surgeryType,
        axillary_surgery: axillarySurgery,
        surgery_date: surgeryDate,
        markers: {
          ER: primaryMarkers.ER,
          PgR: primaryMarkers.PgR,
          HER2: primaryMarkers.HER2,
          Ki67: parseInt(primaryMarkers.Ki67 || '0', 10)
        },
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
      adjuvant_therapy: adjuvantData,
      recurrence: {
        recurrence_date: recurrenceDate,
        markers: {
          ER, PgR,
          HER2: recurrenceMarkers.HER2,
          Ki67: parseInt(recurrenceMarkers.Ki67 || '0', 10),
          sp142: sp142,
          cps: cps,
          msi: msi,
          mmr: mmr
        },
        foundation_one: {
            status: foundationStatus,
            exam_date: foundationDate,
            comment: foundationComment,
          },
        
        biopsy: recurrenceBiopsy,
        biopsy_site: recurrenceBiopsySite,
        biopsy_date: recurrenceBiopsyDate === '' ? null : recurrenceBiopsyDate,
        sites: metastasisSites,
        other_site_detail: otherSiteDetail,
      },
      local_therapy: localTherapy,
      systemic_treatments: treatments,
      interventions: interventions.map(intv => ({
        ...intv,
        biopsy_date: intv.biopsy_date === '' ? null : intv.biopsy_date,
        surgery_date: intv.surgery_date === '' ? null : intv.surgery_date,
        radiation_date: intv.radiation_date === '' ? null : intv.radiation_date,
      })),
      is_deceased: isDeceased,
      date_of_death: isDeceased ? dateOfDeath : null,
      cause_of_death: isDeceased ? (causeOfDeath || '') : '',
    };

    console.log("📤 送信内容（formData）:", JSON.stringify(formData, null, 2));

    try {
      const result = await sendPostProgressionData(formData);
      setResult(result);
    } catch (error) {
      console.error("送信エラー:", error);
    }
  };

  

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-xl font-bold">転移・再発治療フォーム</h2>

      <PatientIdSearchPanel
        patientId={patientId}
        setPatientId={setPatientId}
        onSearch={handlePatientDataLoad} // ←データをstateに反映する関数
      />

      <BasicInfoPanel
  age={age} setAge={setAge}
      birthDate={birthDate} setBirthDate={setBirthDate}
  gender={gender} setGender={setGender}
  isPremenopausal={isPremenopausal} setIsPremenopausal={setIsPremenopausal}
  pastMedicalHistory={pastMedicalHistory} setPastMedicalHistory={setPastMedicalHistory}
  medications={medications} setMedications={setMedications}
  allergies={allergies} setAllergies={setAllergies}
  gbrca={gbrca} setGbrca={setGbrca}
  familyHistory={familyHistory} setFamilyHistory={setFamilyHistory}
/>

<fieldset className="border p-3 rounded">
<legend className="font-semibold">de novo StageIVかの確認</legend>
      <label>
        <input type="checkbox" checked={isDeNovo} onChange={e => setIsDeNovo(e.target.checked)} /> de novo Stage IVならここにチェック
      </label>
    </fieldset>

      {!isDeNovo && (
        <>
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
          <AdjuvantTreatmentPanel
            ref={adjuvantRef}
            receivedNAC={receivedNAC}
            nacRegimen={nacRegimen}
            surgeryType={surgeryType}
          />
        </>
      )}

      <h3>再発時情報</h3>

      <fieldset className="border p-3 rounded">
      <legend className="font-semibold">再発発見時～全身1次治療まで</legend>

      <label>再発発見日：</label>
      <input
        type="date"
        value={recurrenceDate}
        onChange={(e) => setRecurrenceDate(e.target.value)}
      />

      <h4>再発部位：</h4>
        {Object.keys(metastasisSites).map(site => (
          <label key={site} className="mr-4">
            <input
              type="checkbox"
              checked={metastasisSites[site]}
              onChange={e => {
                setMetastasisSites({ ...metastasisSites, [site]: e.target.checked });
                if (site === "other" && !e.target.checked) {
                  setOtherSiteDetail(''); // チェック解除時に内容をクリア
                }
              }}
            /> {site}
          </label>
        ))}

{metastasisSites.other && (
  <div className="mt-2">
    <label>その他の部位（自由記述）：</label>
    <input
      type="text"
      className="border px-2 py-1 w-full mt-1"
      value={otherSiteDetail}
      onChange={e => setOtherSiteDetail(e.target.value)}
    />
  </div>
)}
      <h4>再発時生検：</h4>
      <label><input type="checkbox" checked={recurrenceBiopsy} onChange={e => setRecurrenceBiopsy(e.target.checked)} /> 生検あり</label>
      {recurrenceBiopsy && (<><label>部位：</label><input type="text" value={recurrenceBiopsySite} onChange={e => setRecurrenceBiopsySite(e.target.value)} /></>)}

      <h4>再発時生検マーカー：</h4>
      <ERPgRInputPanel
        useAllred={useAllred} setUseAllred={setUseAllred}
        erPercent={erPercent} setErPercent={setErPercent}
        pgrPercent={pgrPercent} setPgrPercent={setPgrPercent}
        erPS={erPS} setErPS={setErPS}
        erIS={erIS} setErIS={setErIS}
        pgrPS={pgrPS} setPgrPS={setPgrPS}
        pgrIS={pgrIS} setPgrIS={setPgrIS}
      />
      <label>HER2：</label><select value={recurrenceMarkers.HER2} onChange={e => setRecurrenceMarkers({ ...recurrenceMarkers, HER2: e.target.value })}><option value="">選択</option><option value="0">0</option><option value="1+">1+</option><option value="2+ (ISH陰性)">2+ (ISH陰性)</option><option value="2+ (ISH陽性)">2+ (ISH陽性)</option><option value="3+">3+</option></select>
      <label>Ki-67：</label><input type="number" value={recurrenceMarkers.Ki67} onChange={e => setRecurrenceMarkers({ ...recurrenceMarkers, Ki67: e.target.value })} />
      <button type="button" onClick={handleCopyPrimaryMarkers}>原発をコピー</button>

      <fieldset className="border p-3 rounded">
        <legend className="font-semibold">PD-L1・MSI・MMR検査結果</legend>

        <div className="space-y-4">
          {/* PD-L1（SP142） */}
          <div>
            <label className="font-semibold block mb-1">PD-L1（SP142）:</label>
            <div className="flex gap-4 flex-wrap">
              <label>
                <input
                  type="radio"
                  name="sp142"
                  value="none"
                  checked={sp142 === "none"}
                  onChange={e => setSp142(e.target.value)}
                /> 検査なし
              </label>
              <label>
                <input
                  type="radio"
                  name="sp142"
                  value="IC0"
                  checked={sp142 === "IC0"}
                  onChange={e => setSp142(e.target.value)}
                /> IC0（&lt;1%）
              </label>
              <label>
                <input
                  type="radio"
                  name="sp142"
                  value="IC1"
                  checked={sp142 === "IC1"}
                  onChange={e => setSp142(e.target.value)}
                /> IC1（1〜5%）
              </label>
              <label>
                <input
                  type="radio"
                  name="sp142"
                  value="IC2"
                  checked={sp142 === "IC2"}
                  onChange={e => setSp142(e.target.value)}
                /> IC2（5〜10%）
              </label>
              <label>
                <input
                  type="radio"
                  name="sp142"
                  value="IC3"
                  checked={sp142 === "IC3"}
                  onChange={e => setSp142(e.target.value)}
                /> IC3（≧10%）
              </label>
            </div>
          </div>


          {/* PD-L1（22C3） */}
          <div>
            <label className="font-semibold block mb-1">PD-L1（22C3）:</label>
            <div className="flex gap-4 flex-wrap">
              <label>
                <input
                  type="radio"
                  name="pd22c3"
                  value="none"
                  checked={cps === "none"}
                  onChange={e => setCps(e.target.value)}
                /> 検査なし
              </label>
              <label>
                <input
                  type="radio"
                  name="pd22c3"
                  value="lt1"
                  checked={cps === "lt1"}
                  onChange={e => setCps(e.target.value)}
                /> CPS &lt; 1
              </label>
              <label>
                <input
                  type="radio"
                  name="pd22c3"
                  value="1to9"
                  checked={cps === "1to9"}
                  onChange={e => setCps(e.target.value)}
                /> CPS 1〜9
              </label>
              <label>
                <input
                  type="radio"
                  name="pd22c3"
                  value="gte10"
                  checked={cps === "gte10"}
                  onChange={e => setCps(e.target.value)}
                /> CPS ≥ 10
              </label>
            </div>
          </div>

          {/* MSI */}
          <div>
            <label className="font-semibold block mb-1">MSI:</label>
            <div className="flex gap-4 flex-wrap">
              <label>
                <input
                  type="radio"
                  name="msi"
                  value="none"
                  checked={msi === "none"}
                  onChange={e => setMsi(e.target.value)}
                /> 検査なし
              </label>
              <label>
                <input
                  type="radio"
                  name="msi"
                  value="high"
                  checked={msi === "high"}
                  onChange={e => setMsi(e.target.value)}
                /> MSI-High
              </label>
              <label>
                <input
                  type="radio"
                  name="msi"
                  value="low"
                  checked={msi === "low"}
                  onChange={e => setMsi(e.target.value)}
                /> MSI-Low / MSS
              </label>
            </div>
          </div>


          {/* MMR */}
          <div>
            <label className="font-semibold block mb-1">MMR（Mismatch Repair）:</label>
            <div className="flex gap-4 flex-wrap">
              <label>
                <input
                  type="radio"
                  name="mmr"
                  value="none"
                  checked={mmr === "none"}
                  onChange={e => setMmr(e.target.value)}
                /> 検査なし
              </label>
              <label>
                <input
                  type="radio"
                  name="mmr"
                  value="dmmr"
                  checked={mmr === "dmmr"}
                  onChange={e => setMmr(e.target.value)}
                /> dMMR（修復機構欠損）
              </label>
              <label>
                <input
                  type="radio"
                  name="mmr"
                  value="pmmr"
                  checked={mmr === "pmmr"}
                  onChange={e => setMmr(e.target.value)}
                /> pMMR（保全あり）
              </label>
            </div>
          </div>
        </div>
      </fieldset>

      <FoundationOnePanel
        foundationStatus={foundationStatus}
        setFoundationStatus={setFoundationStatus}
        foundationDate={foundationDate}
        setFoundationDate={setFoundationDate}
        foundationComment={foundationComment}
        setFoundationComment={setFoundationComment}
      />

      <h4>局所療法（1次治療前）</h4>
      <label><input type="checkbox" checked={localTherapy.surgery} onChange={e => setLocalTherapy({ ...localTherapy, surgery: e.target.checked })} /> 手術療法</label>
      {localTherapy.surgery && (<><label>日付：</label><input type="date" value={localTherapy.surgery_date} onChange={e => setLocalTherapy({ ...localTherapy, surgery_date: e.target.value })} /><label>内容：</label><input type="text" value={localTherapy.surgery_note} onChange={e => setLocalTherapy({ ...localTherapy, surgery_note: e.target.value })} /></>)}
      <label><input type="checkbox" checked={localTherapy.radiation} onChange={e => setLocalTherapy({ ...localTherapy, radiation: e.target.checked })} /> 放射線療法</label>
      {localTherapy.radiation && (<><label>日付：</label><input type="date" value={localTherapy.radiation_date} onChange={e => setLocalTherapy({ ...localTherapy, radiation_date: e.target.value })} /><label>内容：</label><input type="text" value={localTherapy.radiation_note} onChange={e => setLocalTherapy({ ...localTherapy, radiation_note: e.target.value })} /></>)}

      </fieldset>

      <h3>全身治療歴</h3>
      {treatments.map((t, index) => (
        <div key={t.treatmentLineId} className="border-b mb-4">
          <h4>{t.treatmentLineId}次治療</h4>
          <label>開始日：</label><input type="date" value={t.startDate} onChange={e => {
            const newTreatments = [...treatments];
            newTreatments[index].startDate = e.target.value;
            setTreatments(newTreatments);
          }} /><br />
          <label>終了日：</label><input type="date" value={t.endDate} onChange={e => {
            const newTreatments = [...treatments];
            newTreatments[index].endDate = e.target.value;
            setTreatments(newTreatments);
            if (index === treatments.length - 1 && e.target.value) handleAddTreatmentLine();
          }} /><br />
          <label>薬剤：</label><br />
          {Object.entries(drugCategories).map(([cat, list]) => (
            <div key={cat}><strong>{cat}</strong>{list.map(drug => (
              <label key={drug}><input type="checkbox" checked={t.drugs.includes(drug)} onChange={() => handleDrugChange(t.treatmentLineId, drug)} /> {drug}</label>
            ))}</div>
          ))}
          <label>中止理由：</label>
          <select
            value={t.outcome}
            onChange={(e) => handleOutcomeChange(index, e.target.value)}
          >
            <option value="">選択</option>
            <option value="PD">PD</option>
            <option value="AE">副作用</option>
            <option value="cCR">cCR（完全奏効）</option>
          </select>

          {t.outcome === "PD" && (
            <div className="mt-2 ml-4 border p-2 rounded bg-gray-50">
              <label className="font-semibold">PD時の転移部位：</label><br />
              {Object.keys(t.metastasisSites || {}).map(site => (
                <label key={site} className="mr-4">
                  <input
                    type="checkbox"
                    checked={t.metastasisSites[site]}
                    onChange={e => {
                      const updated = [...treatments];
                      updated[index].metastasisSites[site] = e.target.checked;
                      if (site === "other" && !e.target.checked) {
                        updated[index].otherSiteDetail = '';
                      }
                      setTreatments(updated);
                    }}
                  />
                  {site}
                </label>
              ))}

              {t.metastasisSites?.other && (
                <div className="mt-2">
                  <label>その他の部位：</label>
                  <input
                    type="text"
                    value={t.otherSiteDetail}
                    onChange={e => {
                      const updated = [...treatments];
                      updated[index].otherSiteDetail = e.target.value;
                      setTreatments(updated);
                    }}
                    className="border px-2 py-1 ml-2"
                  />
                </div>
              )}
            </div>
          )}
      



{index < interventions.length && (
  <div className="pl-4 mt-2 border p-2 rounded bg-gray-50">
    <h5 className="font-semibold">介入（{t.treatmentLineId}次治療と{t.treatmentLineId + 1}次治療の間）</h5>

    {/* 生検 */}
<label>
  <input
    type="checkbox"
    checked={interventions[index].biopsy}
    onChange={e => {
      const newInt = [...interventions];
      newInt[index].biopsy = e.target.checked;
      if (e.target.checked && !newInt[index].markers) {
        newInt[index].markers = { ER: '', PgR: '', HER2: '', Ki67: '' };
      }
      setInterventions(newInt);
    }}
  /> 生検
</label>

{interventions[index].biopsy && (
  <div className="pl-4 space-y-2">
    <label>生検日：</label>
    <input
      type="date"
      value={interventions[index].biopsy_date || ''}
      onChange={e => {
        const updated = [...interventions];
        updated[index].biopsy_date = e.target.value;
        setInterventions(updated);
      }}
    />

    <label>部位：</label>
    <input
      type="text"
      value={interventions[index].biopsy_site}
      onChange={e => {
        const newInt = [...interventions];
        newInt[index].biopsy_site = e.target.value;
        setInterventions(newInt);
      }}
    />

    {/* Allredスコア入力切替 */}
    {/* Allredスコア切り替え */}
      <div className="mt-2">
        <label>
          <input
            type="checkbox"
            checked={interventions[index].useAllred || false}
            onChange={e => {
              const updated = [...interventions];
              updated[index].useAllred = e.target.checked;
              setInterventions(updated);
            }}
          /> Allredスコアで入力する
        </label>
      </div>

      {!interventions[index].useAllred ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>ER（％）：</label>
            <input
              type="number"
              name={`erPercent-${index}`}
              value={interventions[index].erPercent || ''}
              onChange={e => {
                const updated = [...interventions];
                updated[index].erPercent = e.target.value;
                setInterventions(updated);
              }}
            />
          </div>
          <div>
            <label>PgR（％）：</label>
            <input
              type="number"
              name={`pgrPercent-${index}`}
              value={interventions[index].pgrPercent || ''}
              onChange={e => {
                const updated = [...interventions];
                updated[index].pgrPercent = e.target.value;
                setInterventions(updated);
              }}
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>ER PS：</label>
            {[0, 1, 2, 3, 4, 5].map(val => (
              <label key={`erps-${val}`} className="mr-2">
                <input
                  type="radio"
                  name={`erPS-${index}`}
                  value={val}
                  checked={interventions[index].erPS == val}
                  onChange={e => {
                    const updated = [...interventions];
                    updated[index].erPS = e.target.value;
                    setInterventions(updated);
                  }}
                /> {val}
              </label>
            ))}
          </div>
          <div>
            <label>ER IS：</label>
            {[0, 1, 2, 3].map(val => (
              <label key={`eris-${val}`} className="mr-2">
                <input
                  type="radio"
                  name={`erIS-${index}`}
                  value={val}
                  checked={interventions[index].erIS == val}
                  onChange={e => {
                    const updated = [...interventions];
                    updated[index].erIS = e.target.value;
                    setInterventions(updated);
                  }}
                /> {val}
              </label>
            ))}
          </div>
          <div>
            <label>PgR PS：</label>
            {[0, 1, 2, 3, 4, 5].map(val => (
              <label key={`pgrps-${val}`} className="mr-2">
                <input
                  type="radio"
                  name={`pgrPS-${index}`}
                  value={val}
                  checked={interventions[index].pgrPS == val}
                  onChange={e => {
                    const updated = [...interventions];
                    updated[index].pgrPS = e.target.value;
                    setInterventions(updated);
                  }}
                /> {val}
              </label>
            ))}
          </div>
          <div>
            <label>PgR IS：</label>
            {[0, 1, 2, 3].map(val => (
              <label key={`pgris-${val}`} className="mr-2">
                <input
                  type="radio"
                  name={`pgrIS-${index}`}
                  value={val}
                  checked={interventions[index].pgrIS == val}
                  onChange={e => {
                    const updated = [...interventions];
                    updated[index].pgrIS = e.target.value;
                    setInterventions(updated);
                  }}
                /> {val}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* HER2 */}
      <div className="mt-2">
        <label>HER2：</label>
        <select
          name={`her2-${index}`}
          value={interventions[index].markers?.HER2 || ''}
          onChange={e => {
            const updated = [...interventions];
            updated[index].markers.HER2 = e.target.value;
            setInterventions(updated);
          }}
        >
          <option value="">選択</option>
          <option value="0">0</option>
          <option value="1+">1+</option>
          <option value="2+ (ISH陰性)">2+ (ISH陰性)</option>
          <option value="2+ (ISH陽性)">2+ (ISH陽性)</option>
          <option value="3+">3+</option>
        </select>
      </div>

      {/* Ki-67 */}
      <div className="mt-2">
        <label>Ki-67：</label>
        <input
          type="number"
          name={`ki67-${index}`}
          value={interventions[index].markers?.Ki67 || ''}
          onChange={e => {
            const updated = [...interventions];
            updated[index].markers.Ki67 = e.target.value;
            setInterventions(updated);
          }}
        />
      </div>

    )

    <div className="space-y-4">

      {/* PD-L1（SP142） */}
      <div>
        <label className="block font-semibold">PD-L1（SP142）:</label>
        <div className="flex flex-wrap gap-4">
          {[
            { value: 'none', label: '検査なし' },
            { value: 'IC0', label: 'IC0（<1%）' },
            { value: 'IC1', label: 'IC1（1〜5%）' },
            { value: 'IC2', label: 'IC2（5〜10%）' },
            { value: 'IC3', label: 'IC3（≥10%）' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center">
              <input
                type="radio"
                name={`sp142-${index}`}
                value={opt.value}
                checked={interventions[index].markers?.sp142 === opt.value}
                onChange={e => {
                  const updated = [...interventions];
                  updated[index].markers.sp142 = e.target.value;
                  setInterventions(updated);
                }}
              />
              <span className="ml-1">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* PD-L1（22C3：CPS） */}
      <div>
        <label className="block font-semibold">PD-L1（22C3：CPS）:</label>
        <div className="flex flex-wrap gap-4">
          {[
            { value: 'none', label: '検査なし' },
            { value: 'lt1', label: 'CPS < 1' },
            { value: '1to9', label: 'CPS 1〜9' },
            { value: 'gte10', label: 'CPS ≥ 10' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center">
              <input
                type="radio"
                name={`cps-${index}`}
                value={opt.value}
                checked={interventions[index].markers?.cps === opt.value}
                onChange={e => {
                  const updated = [...interventions];
                  updated[index].markers.cps = e.target.value;
                  setInterventions(updated);
                }}
              />
              <span className="ml-1">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* MSI */}
      <div>
        <label className="block font-semibold">MSI:</label>
        <div className="flex flex-wrap gap-4">
          {[
            { value: 'none', label: '検査なし' },
            { value: 'high', label: 'MSI-High' },
            { value: 'low', label: 'MSI-Low / MSS' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center">
              <input
                type="radio"
                name={`msi-${index}`}
                value={opt.value}
                checked={interventions[index].markers?.msi === opt.value}
                onChange={e => {
                  const updated = [...interventions];
                  updated[index].markers.msi = e.target.value;
                  setInterventions(updated);
                }}
              />
              <span className="ml-1">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* MMR */}
      <div>
        <label className="block font-semibold">MMR（Mismatch Repair）:</label>
        <div className="flex flex-wrap gap-4">
          {[
            { value: 'none', label: '検査なし' },
            { value: 'dmmr', label: 'dMMR（修復機構欠損）' },
            { value: 'pmmr', label: 'pMMR（保全あり）' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center">
              <input
                type="radio"
                name={`mmr-${index}`}
                value={opt.value}
                checked={interventions[index].markers?.mmr === opt.value}
                onChange={e => {
                  const updated = [...interventions];
                  updated[index].markers.mmr = e.target.value;
                  setInterventions(updated);
                }}
              />
              <span className="ml-1">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>


    </div>


      <button
        type="button"
        onClick={() => {
          const newInt = [...interventions];
          newInt[index].markers = {
            ER: primaryMarkers.ER,
            PgR: primaryMarkers.PgR,
            HER2: primaryMarkers.HER2,
            Ki67: primaryMarkers.Ki67,
            sp142: primaryPdL1.sp142 || 'none',
            cps: primaryPdL1.cps || 'none',
            msi: primaryPdL1.msi || 'none',
            mmr: primaryPdL1.mmr || 'none',
          };
          setInterventions(newInt);
        }}
      >
        直前をコピー
      </button>

    </div>
  
)}


    
  </div>
)}
    <br />

    {/* 手術療法 */}
    <label><input type="checkbox" checked={interventions[index].surgery} onChange={e => {
      const newInt = [...interventions];
      newInt[index].surgery = e.target.checked;
      setInterventions(newInt);
    }} /> 手術療法</label>
    {interventions[index].surgery && (
      <>
        <label>日付：</label>
        <input type="date" value={interventions[index].surgery_date} onChange={e => {
          const newInt = [...interventions];
          newInt[index].surgery_date = e.target.value;
          setInterventions(newInt);
        }} />
        <label>内容：</label>
        <input type="text" value={interventions[index].surgery_note} onChange={e => {
          const newInt = [...interventions];
          newInt[index].surgery_note = e.target.value;
          setInterventions(newInt);
        }} />
      </>
    )}
    <br />

    {/* 放射線療法 */}
    <label><input type="checkbox" checked={interventions[index].radiation} onChange={e => {
      const newInt = [...interventions];
      newInt[index].radiation = e.target.checked;
      setInterventions(newInt);
    }} /> 放射線療法</label>
    {interventions[index].radiation && (
      <>
        <label>日付：</label>
        <input type="date" value={interventions[index].radiation_date} onChange={e => {
          const newInt = [...interventions];
          newInt[index].radiation_date = e.target.value;
          setInterventions(newInt);
        }} />
        <label>内容：</label>
        <input type="text" value={interventions[index].radiation_note} onChange={e => {
          const newInt = [...interventions];
          newInt[index].radiation_note = e.target.value;
          setInterventions(newInt);
        }} />
      </>
    )}
  </div>
),
       
      )}

  <fieldset className="border p-3 rounded">
    <legend className="font-semibold">臓器危機（Visceral Crisis）の有無</legend>
    <label>
      <input
        type="checkbox"
        checked={visceralCrisis}
        onChange={e => setVisceralCrisis(e.target.checked)}
      /> 臓器危機あり（例えば：肝障害・肺障害など症状が急性・重篤）
    </label>
  </fieldset>

  <fieldset className="border p-3 rounded">
    <legend className="font-semibold">死亡の有無</legend>

    <label>
      <input
        type="checkbox"
        checked={isDeceased}
        onChange={(e) => {
          setIsDeceased(e.target.checked);
          if (!e.target.checked) {
            setDateOfDeath('');
            setCauseOfDeath('');
          }
        }}
      />
      {' '}死亡している
    </label>

    {isDeceased && (
      <div className="mt-2 space-y-2">
        <div>
          <label>死亡日：</label>
          <input
            type="date"
            value={dateOfDeath}
            onChange={(e) => setDateOfDeath(e.target.value)}
          />
        </div>

        <div>
          <label>死因：</label>
          <select
            value={causeOfDeath}
            onChange={(e) => setCauseOfDeath(e.target.value)}
          >
            <option value="">選択</option>
            <option value="乳癌死">乳癌死</option>
            <option value="乳癌以外の死因">乳癌以外の死因</option>
            <option value="不明">不明</option>
          </select>
        </div>
      </div>
    )}
  </fieldset>

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
        >
          送信
        </button>
        {result && (
        <div className="mt-6 p-4 border rounded bg-gray-100">
          <h3 className="text-lg font-semibold">🩺 推奨治療</h3>
          <ul className="list-disc ml-6">
            {result["治療提案"]?.map((item, idx) => (
              <li key={`plan-${idx}`}>{item}</li>
            ))}
          </ul>
      
          {result["注意事項"]?.length > 0 && (
            <>
              <h4 className="mt-4 font-semibold">⚠️ 注意事項</h4>
              <ul className="list-disc ml-6 text-red-600">
                {result["注意事項"].map((alert, idx) => (
                  <li key={`alert-${idx}`}>{alert}</li>
                ))}
              </ul>
            </>
          )}
      
          {result["参考文献"]?.length > 0 && (
            <>
              <h4 className="mt-4 font-semibold">📚 参考文献</h4>
              <ul className="list-disc ml-6 text-sm text-gray-700">
                {result["参考文献"].map((ref, idx) => (
                  <li key={`ref-${idx}`}>{ref}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
      </div>
  )
  
      
    
    }

export default PostProgressionTreatmentForm;


