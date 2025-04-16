import React from 'react';

function PrimaryTumorInfoPanel({
  receivedNAC, setReceivedNAC,
  nacRegimen, setNacRegimen,
  nacEndDate, setNacEndDate,
  surgeryType, setSurgeryType,
  axillarySurgery, setAxillarySurgery,
  surgeryDate, setSurgeryDate,
  primaryMarkers, setPrimaryMarkers,
  primaryPdL1, setPrimaryPdL1,
  tumorSize, setTumorSize,
  invasionChestWall, setInvasionChestWall,
  invasionSkin, setInvasionSkin,
  inflammatory, setInflammatory,
  isYpTis, setIsYpTis,
  positiveNodes, setPositiveNodes,
  marginStatus, setMarginStatus,
  grade, setGrade,
  erPercent, setErPercent,
  pgrPercent, setPgrPercent,
  useAllred, setUseAllred,
  erPS, setErPS,
  erIS, setErIS,
  pgrPS, setPgrPS,
  pgrIS, setPgrIS
}) {
  const nacRegimenOptions = [
    { value: 'TNBC_ddAC', label: 'TNBC：ddAC/Taxane' },
    { value: 'TNBC_KEYNOTE', label: 'TNBC：KEYNOTE-522' },
    { value: 'HER2_PTxTmab', label: 'HER2＋：PTx+Tmab' },
    { value: 'HER2_TCbHP', label: 'HER2＋：TCbHP' },
    { value: 'HER2_ACTmabPmab', label: 'HER2＋：AC/Taxane+Tmab+Pmab' },
    { value: 'HR_ACTaxane', label: 'HR＋：AC/Taxane' },
  ];

  return (
    <fieldset className="border p-3 rounded">
      <legend className="font-semibold">原発巣情報</legend>

      <div>
        <label>NAC：</label>
        <label><input type="radio" name="nac" value="true" onChange={() => setReceivedNAC(true)} /> あり</label>
        <label><input type="radio" name="nac" value="false" checked={!receivedNAC} onChange={() => setReceivedNAC(false)} /> なし</label>
      </div>
      {receivedNAC && (
        <>
          <label>NACレジメン：</label>
          <select value={nacRegimen} onChange={e => setNacRegimen(e.target.value)}>
            <option value="">選択してください</option>
            {nacRegimenOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <label>終了日：</label>
          <input type="date" value={nacEndDate} onChange={e => setNacEndDate(e.target.value)} />

          {/* NAC効果判定 */}
    <div className="mt-2">
      <label className="block font-semibold">Anthracycline系の効果判定：</label>
      {['未治療', 'pCR', 'PR', 'SD', 'PD'].map(option => (
        <label key={`anthra-${option}`} className="mr-4">
          <input
            type="radio"
            name="anthraResponse"
            value={option}
            checked={primaryMarkers.anthraResponse === option}
            onChange={e => setPrimaryMarkers({ ...primaryMarkers, anthraResponse: e.target.value })}
          /> {option}
        </label>
      ))}
    </div>

    <div className="mt-2">
      <label className="block font-semibold">Taxane系の効果判定：</label>
      {['未治療', 'pCR', 'PR', 'SD', 'PD'].map(option => (
        <label key={`taxane-${option}`} className="mr-4">
          <input
            type="radio"
            name="taxaneResponse"
            value={option}
            checked={primaryMarkers.taxaneResponse === option}
            onChange={e => setPrimaryMarkers({ ...primaryMarkers, taxaneResponse: e.target.value })}
          /> {option}
        </label>
      ))}
    </div>
  </>
)}

      <div>
        <label>乳房手術：</label>
        <label><input type="radio" name="surgery" value="Bp" onChange={e => setSurgeryType(e.target.value)} /> Bp</label>
        <label><input type="radio" name="surgery" value="Bt" onChange={e => setSurgeryType(e.target.value)} /> Bt</label>
      </div>
      <div>
        <label>腋窩手術：</label>
        <label><input type="radio" name="axillary" value="SLNB" onChange={e => setAxillarySurgery(e.target.value)} /> SLNB</label>
        <label><input type="radio" name="axillary" value="Ax" onChange={e => setAxillarySurgery(e.target.value)} /> Ax</label>
        <label><input type="radio" name="axillary" value="none" onChange={e => setAxillarySurgery(e.target.value)} /> 無し</label>
      </div>
      <label>手術日：</label>
      <input type="date" value={surgeryDate} onChange={e => setSurgeryDate(e.target.value)} /><br />

      <label>腫瘍径（mm）：</label>
      <input type="number" value={tumorSize} onChange={e => setTumorSize(e.target.value)} /><br />
      <label><input type="checkbox" checked={invasionChestWall} onChange={e => setInvasionChestWall(e.target.checked)} /> 胸壁浸潤</label>
      <label><input type="checkbox" checked={invasionSkin} onChange={e => setInvasionSkin(e.target.checked)} /> 表皮浸潤</label>
      <label><input type="checkbox" checked={inflammatory} onChange={e => setInflammatory(e.target.checked)} /> 炎症性乳癌</label><br />
      {receivedNAC && (
        <label><input type="checkbox" checked={isYpTis} onChange={e => setIsYpTis(e.target.checked)} /> ypTis</label>
      )}<br />

      <label>陽性リンパ節数（個）：</label>
      <input type="number" value={positiveNodes} onChange={e => setPositiveNodes(e.target.value)} /><br />

      <label>断端：</label>
      <label><input type="radio" name="margin" value="なし" checked={marginStatus === 'なし'} onChange={e => setMarginStatus(e.target.value)} /> なし</label>
      <label><input type="radio" name="margin" value="近接" checked={marginStatus === '近接'} onChange={e => setMarginStatus(e.target.value)} /> 近接</label>
      <label><input type="radio" name="margin" value="露出" checked={marginStatus === '露出'} onChange={e => setMarginStatus(e.target.value)} /> 露出</label><br />

      <label>Grade：</label>
      <select value={grade} onChange={e => setGrade(e.target.value)}>
        <option value="">選択してください</option>
        <option value="Grade 1">Grade 1</option>
        <option value="Grade 2">Grade 2</option>
        <option value="Grade 3">Grade 3</option>
      </select><br />

      {/* マーカー入力部：ER／PgR → HER2／Ki-67 の順番で並べる */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {!useAllred && (
            <>
              <div>
                <label>ER（％）：</label>
                <input
                  type="number"
                  value={erPercent}
                  onChange={(e) => setErPercent(e.target.value)}
                />
              </div>
              <div>
                <label>PgR（％）：</label>
                <input
                  type="number"
                  value={pgrPercent}
                  onChange={(e) => setPgrPercent(e.target.value)}
                />
              </div>
            </>
          )}

          <div>
            <label>HER2：</label>
            <select
              value={primaryMarkers.HER2}
              onChange={(e) => setPrimaryMarkers({ ...primaryMarkers, HER2: e.target.value })}
            >
              <option value="">選択してください</option>
              <option value="0">0</option>
              <option value="1+">1+</option>
              <option value="2+ (ISH陰性)">2+（ISH陰性）</option>
              <option value="2+ (ISH陽性)">2+（ISH陽性）</option>
              <option value="3+">3+</option>
            </select>
          </div>

          <div>
            <label>Ki-67（％）：</label>
            <input
              type="number"
              value={primaryMarkers.Ki67}
              onChange={(e) => setPrimaryMarkers({ ...primaryMarkers, Ki67: e.target.value })}
            />
          </div>
        </div>

        {/* Allredスコア入力（必要に応じて表示） */}
        <div className="mt-3">
          <label>
            <input
              type="checkbox"
              checked={useAllred}
              onChange={(e) => setUseAllred(e.target.checked)}
            />
            Allredスコアで入力する
          </label>

          {useAllred && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="block font-semibold">ER PS：</label>
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <label key={`erPS-${num}`} className="mr-2">
                    <input
                      type="radio"
                      name="erPS"
                      value={num}
                      checked={erPS === String(num)}
                      onChange={() => setErPS(String(num))}
                    /> {num}
                  </label>
                ))}
              </div>
              <div>
                <label className="block font-semibold">ER IS：</label>
                {[0, 1, 2, 3].map(num => (
                  <label key={`erIS-${num}`} className="mr-2">
                    <input
                      type="radio"
                      name="erIS"
                      value={num}
                      checked={erIS === String(num)}
                      onChange={() => setErIS(String(num))}
                    /> {num}
                  </label>
                ))}
              </div>
              <div>
                <label className="block font-semibold">PgR PS：</label>
                {[0, 1, 2, 3, 4, 5].map(num => (
                  <label key={`pgrPS-${num}`} className="mr-2">
                    <input
                      type="radio"
                      name="pgrPS"
                      value={num}
                      checked={pgrPS === String(num)}
                      onChange={() => setPgrPS(String(num))}
                    /> {num}
                  </label>
                ))}
              </div>
              <div>
                <label className="block font-semibold">PgR IS：</label>
                {[0, 1, 2, 3].map(num => (
                  <label key={`pgrIS-${num}`} className="mr-2">
                    <input
                      type="radio"
                      name="pgrIS"
                      value={num}
                      checked={pgrIS === String(num)}
                      onChange={() => setPgrIS(String(num))}
                    /> {num}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>



      {/* PD-L1（TNBC条件） */}
      {primaryMarkers.ER === '陰性' && primaryMarkers.PgR === '陰性' &&
        (primaryMarkers.HER2 === '0' || primaryMarkers.HER2 === '1+' || primaryMarkers.HER2 === '2+ (ISH陰性)') && (
          <fieldset>
            <legend>PD-L1発現（TNBCのみ）</legend>
            <label>
              <input type="checkbox" checked={primaryPdL1.includes('SP142陽性')} onChange={e => {
                if (e.target.checked) setPrimaryPdL1([...primaryPdL1, 'SP142陽性']);
                else setPrimaryPdL1(primaryPdL1.filter(p => p !== 'SP142陽性'));
              }} /> SP142陽性
            </label>
            <label className="ml-30">
              <input type="checkbox" checked={primaryPdL1.includes('22C3陽性')} onChange={e => {
                if (e.target.checked) setPrimaryPdL1([...primaryPdL1, '22C3陽性']);
                else setPrimaryPdL1(primaryPdL1.filter(p => p !== '22C3陽性'));
              }} /> 22C3陽性
            </label>
          </fieldset>
      )}
    </fieldset>
  );
}

export default PrimaryTumorInfoPanel;
