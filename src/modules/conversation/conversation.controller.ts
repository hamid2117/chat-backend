import { Request, Response, NextFunction } from 'express'
import conversationService from './conversation.service'
import { successResponse } from '../../utils/response'
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
      req.user!.id,
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
    const conversation = await conversationService.getConversationById(id, req.user!.id)
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
      req.user!.id,
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
      req.user!.id,
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
    const data = updateGroupDetailsSchema.parse(req.body)
    const conversation = await conversationService.updateGroupDetails(
      id,
      req.user!.id,
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
      req.user!.id,
      data
    )
    res.status(200).json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export const updateParticipantRole = async (
  req: Request<{ id: string; userId: string }, {}, UpdateParticipantRoleRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, userId } = participantIdSchema.parse({
      conversationId: req.params.id,
      userId: req.params.userId,
    })
    const data = updateParticipantRoleSchema.parse(req.body)
    const conversation = await conversationService.updateParticipantRole(
      id,
      userId,
      req.user!.id,
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
    constimport { Request, Response, NextFunction } from 'express'
import conversationService from './conversation.service'
import { successResponse } from '../../utils/response'
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
      req.user!.id,
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
    const conversation = await conversationService.getConversationById(id, req.user!.id)
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
      req.user!.id,
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
      req.user!.id,
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
    const data = updateGroupDetailsSchema.parse(req.body)
    const conversation = await conversationService.updateGroupDetails(
      id,
      req.user!.id,
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
      req.user!.id,
      data
    )
    res.status(200).json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

export const updateParticipantRole = async (
  req: Request<{ id: string; userId: string }, {}, UpdateParticipantRoleRequest>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, userId } = participantIdSchema.parse({
      conversationId: req.params.id,
      userId: req.params.userId,
    })
    const data = updateParticipantRoleSchema.parse(req.body)
    const conversation = await conversationService.updateParticipantRole(
      id,
      userId,
      req.user!.id,
      data
    )
    res.status(200).json(successResponse(conversation))
  } catch (err) {
    next(err)
  }
}

//export const removeParticipant = async (
//  req: Request<{ id: string; userId: string }>,
//  res: Response,
//  next: NextFunction
//): Promise<void> => {
//  try {
//    const