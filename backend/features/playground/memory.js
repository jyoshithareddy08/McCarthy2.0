import Message from "../../models/Message.js";

export const getHistory = async (sessionId) => {
  return await Message.find({ sessionId })
    .sort({ createdAt: 1 })
    .limit(6);
};

export const saveMessage = async (sessionId, prompt, response) => {
  return await Message.create({
    sessionId,
    prompt,
    response
  });
};
