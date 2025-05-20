import React from 'react';

function ChangeLogPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📝 変更履歴</h1>
      <ul className="list-disc ml-6 space-y-2 text-sm">
        <li><strong>2025/05/20:</strong> 【Ver1.1】 リリース！</li>
        <li><strong>2025/05/20:</strong> 変更履歴ページを作成・追加</li>
        <li><strong>2025/05/20:</strong> TNBC転移再発ロジックをICI/SG/T-DXd対応に変更</li>
        <li><strong>2025/05/20:</strong> PD-L1、MSI、MMRのラジオボタン横並び化</li>
        <li><strong>2025/05/18:</strong> 術後推奨出力に参考文献とアラート表示機能を追加</li>
        {/* 必要に応じて追加 */}
      </ul>
    </div>
  );
}

export default ChangeLogPage;
