// loadPatientData.js

export function loadPatientDataCommon(data, setters) {
  const {
    setGender, setBirthDate, setIsPremenopausal,
    setPastMedicalHistory, setMedications, setAllergies, setGbrca,
    setFamilyHistory, setOtherInfo,
    setSide, setRegions, setTumorSize, setLymphEvaluation, setHistology,
    setIsInvasive, setGrade, setMarkers,
    setUseAllred, setErPercent, setPgrPercent, setErPS, setErIS, setPgrPS, setPgrIS
  } = setters;

  const basic = data.basic_info || {};
  setGender?.(basic.gender || '');
  setBirthDate?.(basic.birth_date || '');
  setIsPremenopausal?.(basic.is_premenopausal || false);
  setPastMedicalHistory?.(basic.past_treatment || '');
  setMedications?.(basic.medications || '');
  setAllergies?.(basic.allergies || '');
  setGbrca?.(basic.other_info?.gBRCA || '未検査');

  const fh = basic.family_history || {};
  const selected = [];
  if (fh.breast) selected.push("乳がん");
  if (fh.ovary) selected.push("卵巣がん");
  if (fh.peritoneum) selected.push("腹膜がん");
  if (fh.pancreas) selected.push("膵臓がん");
  if (fh.others) selected.push("その他");
  setFamilyHistory?.(selected);

  setOtherInfo?.({
    frailty: basic.other_info?.frailty ?? null,
    notes: basic.other_info?.notes || '',
  });

  const details = data.primary || {};
  setSide?.(details.side || '');
  setRegions?.(details.regions || { A: false, B: false, C: false, D: false, E: false });
  setTumorSize?.(details.tumor_size?.toString() || '');
  setLymphEvaluation?.(details.lymph_evaluation || '');
  setHistology?.(details.histology || '');
  setIsInvasive?.(details.is_invasive || false);
  setGrade?.(details.grade || '');

  const mk = details.markers || {};
  setMarkers?.({
    ER: mk.ER || '',
    PgR: mk.PgR || '',
    HER2: mk.HER2 || '',
    Ki67: mk.Ki67?.toString() || '',
  });

  setUseAllred?.(false);
  if (
    'er_percent' in mk || 'pgr_percent' in mk ||
    'er_ps' in mk || 'er_is' in mk || 'pgr_ps' in mk || 'pgr_is' in mk
  ) {
    setUseAllred?.(true);
    setErPercent?.(mk.er_percent?.toString() || '');
    setPgrPercent?.(mk.pgr_percent?.toString() || '');
    setErPS?.(mk.er_ps?.toString() || '');
    setErIS?.(mk.er_is?.toString() || '');
    setPgrPS?.(mk.pgr_ps?.toString() || '');
    setPgrIS?.(mk.pgr_is?.toString() || '');
  }
}
