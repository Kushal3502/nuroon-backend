import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiError, ApiResponse, asyncHandler } from '../../utils';
import {
  createChatbot as addChatbot,
  deleteChatbotById,
  findChatbotById,
  findChatbotByName,
  getAllChatbots,
  updateChatbot,
} from './chatbot.service';

const verifyOwnership = (chatbot: any, ownerId: string) => {
  if (chatbot.owner.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'You are not authorized to perform this action');
  }
};

export const fetchAllChatbots = asyncHandler(
  async (req: Request, res: Response) => {
    const ownerId = req.user?._id;

    if (!ownerId) {
      throw new ApiError(401, 'Unauthorized user not found in request');
    }

    const chatbots = await getAllChatbots(ownerId);

    res
      .status(200)
      .json(
        new ApiResponse(200, 'Chatbots fetched successfully.', { chatbots }),
      );
  },
);

export const fetchChatbotById = asyncHandler(
  async (req: Request, res: Response) => {
    const { chatbotId } = req.params;

    if (!chatbotId) {
      throw new ApiError(401, 'Please provide a chatbotId');
    }

    if (!mongoose.Types.ObjectId.isValid(chatbotId)) {
      throw new ApiError(400, 'Invalid chatbotId format');
    }

    const chatbot = await findChatbotById(chatbotId);

    if (!chatbot) throw new ApiError(404, 'Invalid chatbotId');

    res.status(200).json(
      new ApiResponse(200, 'Chatbot fetched successfully.', {
        chatbot,
      }),
    );
  },
);

export const createChatbot = asyncHandler(
  async (req: Request, res: Response) => {
    const { name, logo, description } = req.body;
    const ownerId = req?.user?._id;

    if (!ownerId) {
      throw new ApiError(401, 'Unauthorized user not found in request');
    }

    if (!name)
      throw new ApiError(400, 'Please provide a name for your chatbot');

    // search for same name chatbot
    const isExists = await findChatbotByName(name, ownerId);

    if (isExists)
      throw new ApiError(400, 'Chatbot already exists with this name.');

    const chatbot = await addChatbot({
      name,
      description,
      logo,
      owner: ownerId,
    });

    res
      .status(201)
      .json(new ApiResponse(201, 'Chatbot created successfully.', chatbot));
  },
);

export const editChatbot = asyncHandler(async (req: Request, res: Response) => {
  const { chatbotId } = req.params;

  const { name, logo, description } = req.body;

  const ownerId = req.user?._id;

  if (!ownerId) {
    throw new ApiError(401, 'Unauthorized user not found in request');
  }

  if (!chatbotId) {
    throw new ApiError(401, 'Please provide a chatbotId');
  }

  if (!mongoose.Types.ObjectId.isValid(chatbotId)) {
    throw new ApiError(400, 'Invalid chatbotId format');
  }

  const isExists = await findChatbotById(chatbotId);

  if (!isExists) throw new ApiError(404, 'Invalid chatbotId');

  verifyOwnership(isExists, ownerId);

  const payload = {
    name: name ?? isExists.name,
    description: description ?? isExists.description,
    logo: logo ?? isExists.logo,
  };

  const updatedChatbotData = await updateChatbot(chatbotId, payload);

  res.status(200).json(
    new ApiResponse(200, 'Chatbot updated successfully', {
      chatbot: updatedChatbotData,
    }),
  );
});

export const deleteChatbot = asyncHandler(
  async (req: Request, res: Response) => {
    const { chatbotId } = req.params;
    const ownerId = req.user?._id;

    if (!ownerId) {
      throw new ApiError(401, 'Unauthorized user not found in request');
    }

    if (!chatbotId) {
      throw new ApiError(401, 'Please provide a chatbotId');
    }

    if (!mongoose.Types.ObjectId.isValid(chatbotId)) {
      throw new ApiError(400, 'Invalid chatbotId format');
    }

    const isExists = await findChatbotById(chatbotId);

    if (!isExists) throw new ApiError(404, 'Invalid chatbotId');

    verifyOwnership(isExists, ownerId);

    await deleteChatbotById(chatbotId);

    res.status(200).json(new ApiResponse(200, 'Chatbot deleted successfully.'));
  },
);
