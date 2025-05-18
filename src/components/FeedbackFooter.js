import React from 'react';

function FeedbackFooter() {
  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-gray-300 py-2 flex justify-center z-50">
      <a
        href="https://docs.google.com/forms/d/e/1FAIpQLScs_piuNooSJ6vDIDyDGO16tNuRENg_gYvtBkTVbMHK80nqVA/viewform"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
      >
        使用感アンケートに答える
      </a>
    </div>
  );
}

export default FeedbackFooter;
