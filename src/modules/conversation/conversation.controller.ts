import { Request, Response, NextFunction } from 'express'
import conversationService from './conversation.service'
import { successResponse } from '../../utils'
import {
  createDirectConversationSchema,
  createGroupConversationSchema,
  updateGroupDetailsSchema,
  addParticipantSchema,
  updateParticipantRoleSchema,
  conversationIdSchema,
  participantIdSchema,
  getConversationsQuerySchema,
  CreateDirectConversationRequest,
  CreateGroupConversationRequest,
  UpdateGroupDetailsRequest,
  AddParticipantRequest,
  UpdateParticipantRoleRequest,
} from './conversation.schema'

export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = getConversationsQuerySchema.parse(req.query)
    const conversations = await conversationService.getConversations(
      req.user.id,
      query
    )
    res.status(200).json(successResponse(conversations))
  } catch (err) {
    next(err)
  }
}

export const getConversationById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = conversationIdSchema.parse({ id: req.params.id })
    const conversation = await conversationService.getConversationById(
      id,
      req.user.id
    )
    res.status(200).json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export const createDirectConversation = async (
  req: Request<{}, {}, CreateDirectConversationRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = createDirectConversationSchema.parse(req.body)
    const conversation = await conversationService.createDirectConversation(
      req.user.id,
      data
    )
    res.status(201).json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export const createGroupConversation = async (
  req: Request<{}, {}, CreateGroupConversationRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const data = createGroupConversationSchema.parse(req.body)
    const conversation = await conversationService.createGroupConversation(
      req.user.id,
      data
    )
    res.status(201).json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export const updateGroupDetails = async (
  req: Request<{ id: string }, {}, UpdateGroupDetailsRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = conversationIdSchema.parse({ id: req.params.id })

    const multerFile = (req as any).file

    if (multerFile && req.filePath) {
      req.body.groupPicture = req.filePath
    }

    if (req.body.participants && typeof req.body.participants === 'string') {
      try {
        req.body.participants = JSON.parse(req.body.participants)
      } catch (e) {
        console.error(e)
      }
    }

    const data = updateGroupDetailsSchema.parse(req.body)
    const conversation = await conversationService.updateGroupDetails(
      id,
      req.user.id,
      data
    )
    res.status(200).json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export const addParticipant = async (
  req: Request<{ id: string }, {}, AddParticipantRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = conversationIdSchema.parse({ id: req.params.id })
    const data = addParticipantSchema.parse(req.body)
    const conversation = await conversationService.addParticipant(
      id,
      req.user.id,
      data
    )
    res.status(200).json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export const updateParticipantRole = async (
  req: Request<
    { id: string; userId: string },
    {},
    UpdateParticipantRoleRequest
  >,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { conversationId, userId } = participantIdSchema.parse({
      conversationId: req.params.id,
      userId: req.params.userId,
    })
    const data = updateParticipantRoleSchema.parse(req.body)
    const conversation = await conversationService.updateParticipantRole(
      conversationId,
      userId,
      req.user.id,
      data
    )
    res.status(200).json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export const removeParticipant = async (
  req: Request<{ id: string; userId: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { conversationId, userId } = participantIdSchema.parse({
      conversationId: req.params.id,
      userId: req.params.userId,
    })
    const result = await conversationService.removeParticipant(
      conversationId,
      userId,
      req.user.id
    )
    res.status(200).json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

export const deleteConversation = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = conversationIdSchema.parse({ id: req.params.id })
    const result = await conversationService.deleteConversation(id, req.user.id)
    res.status(200).json(successResponse(result))
  } catch (err) {
    next(err)
  }
}

export const markConversationSeen = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = conversationIdSchema.parse({ id: req.params.id })
    await conversationService.markConversationSeen(id, req.user.id)

    res.status(200).json({
      success: true,
      message: 'Conversation marked as seen',
    })
  } catch (err) {
    next(err)
  }
}

export default {
  getConversations,
  getConversationById,
  createDirectConversation,
  createGroupConversation,
  updateGroupDetails,
  addParticipant,
  updateParticipantRole,
  removeParticipant,
  deleteConversation,
  markConversationSeen,
}
