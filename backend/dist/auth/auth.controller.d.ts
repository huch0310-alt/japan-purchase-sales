import { Response } from 'express';
import { AuthService } from './auth.service';
import { AuthenticatedRequest } from '../common/types';
declare class LoginDto {
    username: string;
    password: string;
}
declare class ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    private getCookieSecure;
    private getCookieSameSite;
    private getAuthCookieMaxAgeMs;
    staffLogin(loginDto: LoginDto, res: Response): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            name: string;
            role: string;
            type: string;
        };
    }>;
    customerLogin(loginDto: LoginDto, res: Response): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            companyName: string;
            role: string;
            type: string;
        };
    }>;
    verifyToken(req: AuthenticatedRequest): Promise<import("../common/types").UserPayload>;
    changePassword(req: AuthenticatedRequest, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
export {};
