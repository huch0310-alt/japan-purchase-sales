import { AuthService } from './auth.service';
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
    staffLogin(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            name: any;
            role: any;
            type: string;
        };
    }>;
    customerLogin(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            username: any;
            companyName: any;
            role: string;
            type: string;
        };
    }>;
    verifyToken(req: any): Promise<any>;
    changePassword(req: any, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
export {};
