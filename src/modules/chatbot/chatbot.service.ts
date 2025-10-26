import { Chatbot } from './chatbot.model';

interface ChatbotPayload {
  name?: string;
  description?: string;
  logo?: string;
  owner?: string;
}

export const findChatbotByName = async (name: string, ownerId: string) => {
  return await Chatbot.findOne({
    name,
    owner: ownerId,
  });
};

export const getAllChatbots = async (ownerId: string) => {
  return await Chatbot.find({
    owner: ownerId,
  });
};

export const findChatbotById = async (chatbotId: string) => {
  return await Chatbot.findById(chatbotId);
};

export const createChatbot = async (payload: ChatbotPayload) => {
  return await Chatbot.create(payload);
};

export const updateChatbot = async (
  chatbotId: string,
  payload: ChatbotPayload,
) => {
  return await Chatbot.findByIdAndUpdate(
    chatbotId,
    {
      $set: payload,
    },
    {
      new: true,
      runValidators: true,
    },
  );
};

export const deleteChatbotById = async (chatbotId: string) => {
  await Chatbot.findByIdAndDelete(chatbotId);
};
