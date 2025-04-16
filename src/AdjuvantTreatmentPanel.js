// src/AdjuvantTreatmentPanel.js
import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

const AdjuvantTreatmentPanel = forwardRef(({ receivedNAC, nacRegimen, surgeryType }, ref) => {
  const [ivChemo, setIvChemo] = useState({ ddac: false, ac_ec: false, dtx: false, ptx: false, endDate: '', ongoing: false });
  const [rtx, setRtx] = useState({ pmrt: false, wbrt: surgeryType === 'Bp', endDate: '' });
  const [targeted, setTargeted] = useState({
    pembro: receivedNAC && nacRegimen === 'TNBC_KEYNOTE',
    abema: false,
    pembroEnd: '',
    abemaEnd: '',
    pembroOngoing: false,
    abemaOngoing: false,
  });
  const [her2, setHer2] = useState({
    tmab: false,
    tmabPmab: false,
    tdm1: false,
    endDate: '',
    ongoing: false,
  });
  const [poChemo, setPoChemo] = useState({ ts1: false, endDate: '', ongoing: false });
  const [endocrine, setEndocrine] = useState({
    tam: false,
    ana: false,
    let: false,
    exe: false,
    lh_rha: false,
    endDate: '',
    ongoing: false,
  });

  useEffect(() => {
    setRtx(prev => ({ ...prev, wbrt: surgeryType === 'Bp' }));
    setTargeted(prev => ({ ...prev, pembro: receivedNAC && nacRegimen === 'TNBC_KEYNOTE' }));
  }, [receivedNAC, nacRegimen, surgeryType]);

  useImperativeHandle(ref, () => ({
    getAdjuvantData: () => ({
      iv_chemo: ivChemo,
      radiation: rtx,
      targeted,
      her2,
      po_chemo: poChemo,
      endocrine,
    })
  }));

  return (
    <fieldset className="border p-4 mt-4">
      <legend className="font-bold">術後補助療法</legend>

      {/* IV Chemo */}
      <div>
        <h4>IV Chemo</h4>
        <label><input type="checkbox" checked={ivChemo.ddac} onChange={e => setIvChemo({ ...ivChemo, ddac: e.target.checked })} /> ddAC</label>
        <label><input type="checkbox" checked={ivChemo.ac_ec} onChange={e => setIvChemo({ ...ivChemo, ac_ec: e.target.checked })} /> AC(EC)</label>
        <label><input type="checkbox" checked={ivChemo.dtx} onChange={e => setIvChemo({ ...ivChemo, dtx: e.target.checked })} /> DTx</label>
        <label><input type="checkbox" checked={ivChemo.ptx} onChange={e => setIvChemo({ ...ivChemo, ptx: e.target.checked })} /> PTx</label><br />
        <label>最終投与日：<input type="date" value={ivChemo.endDate} onChange={e => setIvChemo({ ...ivChemo, endDate: e.target.value })} disabled={ivChemo.ongoing} /></label>
        <label><input type="checkbox" checked={ivChemo.ongoing} onChange={e => setIvChemo({ ...ivChemo, ongoing: e.target.checked })} /> 治療中</label>
      </div>

      {/* RTx */}
      <div>
        <h4>放射線療法（RTx）</h4>
        <label><input type="checkbox" checked={rtx.pmrt} onChange={e => setRtx({ ...rtx, pmrt: e.target.checked })} /> PMRT</label>
        <label><input type="checkbox" checked={rtx.wbrt} onChange={e => setRtx({ ...rtx, wbrt: e.target.checked })} /> WBRT</label>
        <label>最終治療日：<input type="date" value={rtx.endDate} onChange={e => setRtx({ ...rtx, endDate: e.target.value })} /></label>
      </div>

      {/* 分子標的薬 */}
      <div>
        <h4>分子標的薬</h4>
        <label><input type="checkbox" checked={targeted.pembro} onChange={e => setTargeted({ ...targeted, pembro: e.target.checked })} /> Pembro</label>
        <label>最終投与日：<input type="date" value={targeted.pembroEnd} onChange={e => setTargeted({ ...targeted, pembroEnd: e.target.value })} disabled={targeted.pembroOngoing} /></label>
        <label><input type="checkbox" checked={targeted.pembroOngoing} onChange={e => setTargeted({ ...targeted, pembroOngoing: e.target.checked })} /> 治療中</label><br />
        <label><input type="checkbox" checked={targeted.abema} onChange={e => setTargeted({ ...targeted, abema: e.target.checked })} /> Abema</label>
        <label>最終投与日：<input type="date" value={targeted.abemaEnd} onChange={e => setTargeted({ ...targeted, abemaEnd: e.target.value })} disabled={targeted.abemaOngoing} /></label>
        <label><input type="checkbox" checked={targeted.abemaOngoing} onChange={e => setTargeted({ ...targeted, abemaOngoing: e.target.checked })} /> 治療中</label>
      </div>

      {/* HER2療法 */}
      <div>
        <h4>抗HER2療法</h4>
        <label><input type="checkbox" checked={her2.tmab} onChange={e => setHer2({ ...her2, tmab: e.target.checked })} /> Tmab</label>
        <label><input type="checkbox" checked={her2.tmabPmab} onChange={e => setHer2({ ...her2, tmabPmab: e.target.checked })} /> Tmab+Pmab</label>
        <label><input type="checkbox" checked={her2.tdm1} onChange={e => setHer2({ ...her2, tdm1: e.target.checked })} /> T-DM1</label>
        <label>最終投与日：<input type="date" value={her2.endDate} onChange={e => setHer2({ ...her2, endDate: e.target.value })} disabled={her2.ongoing} /></label>
        <label><input type="checkbox" checked={her2.ongoing} onChange={e => setHer2({ ...her2, ongoing: e.target.checked })} /> 治療中</label>
      </div>

      {/* PO Chemo */}
      <div>
        <h4>経口化学療法（PO Chemo）</h4>
        <label><input type="checkbox" checked={poChemo.ts1} onChange={e => setPoChemo({ ...poChemo, ts1: e.target.checked })} /> TS-1</label>
        <label>最終投与日：<input type="date" value={poChemo.endDate} onChange={e => setPoChemo({ ...poChemo, endDate: e.target.value })} disabled={poChemo.ongoing} /></label>
        <label><input type="checkbox" checked={poChemo.ongoing} onChange={e => setPoChemo({ ...poChemo, ongoing: e.target.checked })} /> 治療中</label>
      </div>

      {/* 内分泌療法 */}
      <div>
        <h4>内分泌療法</h4>
        <label><input type="checkbox" checked={endocrine.tam} onChange={e => setEndocrine({ ...endocrine, tam: e.target.checked })} /> TAM</label>
        <label><input type="checkbox" checked={endocrine.ana} onChange={e => setEndocrine({ ...endocrine, ana: e.target.checked })} /> ANA</label>
        <label><input type="checkbox" checked={endocrine.let} onChange={e => setEndocrine({ ...endocrine, let: e.target.checked })} /> LET</label>
        <label><input type="checkbox" checked={endocrine.exe} onChange={e => setEndocrine({ ...endocrine, exe: e.target.checked })} /> EXE</label>
        <label><input type="checkbox" checked={endocrine.lh_rha} onChange={e => setEndocrine({ ...endocrine, lh_rha: e.target.checked })} /> LH-RHa</label>
        <label>最終投与日：<input type="date" value={endocrine.endDate} onChange={e => setEndocrine({ ...endocrine, endDate: e.target.value })} disabled={endocrine.ongoing} /></label>
        <label><input type="checkbox" checked={endocrine.ongoing} onChange={e => setEndocrine({ ...endocrine, ongoing: e.target.checked })} /> 治療中</label>
      </div>
    </fieldset>
  );
}
);

export default AdjuvantTreatmentPanel;
