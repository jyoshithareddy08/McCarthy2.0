export const analyzePrompt = (prompt) => {

    const text = prompt.toLowerCase();
  
    if (text.includes("code")) return "coding";
    if (text.includes("image")) return "image";
    if (text.includes("video")) return "video";
    if (text.includes("humanize")) return "rewriting";
  
    return "text";
  };
  