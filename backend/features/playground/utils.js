export const buildPrompt = (history, newPrompt) => {

    let text = "";
  
    history.forEach(m => {
      text += `User: ${m.prompt}\n`;
      text += `AI: ${m.response}\n`;
    });
  
    text += `User: ${newPrompt}\nAI:`;
  
    return text;
  };
  