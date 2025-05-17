export function interpretERStatus({ useAllred, erPercent, erPS, erIS }) {
    if (useAllred) {
      const total = parseInt(erPS || 0) + parseInt(erIS || 0);
      return total >= 3 ? "陽性" : total === 2 ? "弱陽性" : "陰性";
    } else {
      const percent = parseFloat(erPercent);
      if (percent >= 10) return "陽性";
      if (percent >= 1) return "弱陽性";
      return "陰性";
    }
  }
  
  export function interpretPgRStatus({ useAllred, pgrPercent, pgrPS, pgrIS }) {
    if (useAllred) {
      const total = parseInt(pgrPS || 0) + parseInt(pgrIS || 0);
      return total >= 3 ? "陽性" : total === 2 ? "弱陽性" : "陰性";
    } else {
      const percent = parseFloat(pgrPercent);
      if (percent >= 10) return "陽性";
      if (percent >= 1) return "弱陽性";
      return "陰性";
    }
  }
  