import { MessagesService } from './messages.service';
import { AuthenticatedRequest } from '../common/types';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    findAll(req: AuthenticatedRequest): Promise<{
        messages: import("../common/entities/message.entity").Message[];
        unreadCount: number;
    }>;
    getUnreadCount(req: AuthenticatedRequest): Promise<{
        count: number;
    }>;
    markAsRead(id: string): Promise<{
        message: string;
    }>;
    markAllAsRead(req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
