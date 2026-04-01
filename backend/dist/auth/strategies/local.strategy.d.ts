import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Staff } from '../../users/entities/staff.entity';
import { Customer } from '../../users/entities/customer.entity';
type LoginUser = Omit<Staff, 'passwordHash'> & {
    type: 'staff';
} | Omit<Customer, 'passwordHash'> & {
    type: 'customer';
};
declare const LocalStrategy_base: new (...args: any[]) => Strategy;
export declare class LocalStrategy extends LocalStrategy_base {
    private authService;
    constructor(authService: AuthService);
    validate(username: string, password: string): Promise<LoginUser>;
}
export {};
