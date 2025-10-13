import { UserRole } from 'src/users/entities/user.entity';
export declare class RegisterDto {
    email: string;
    fullName: string;
    username: string;
    password: string;
    role?: UserRole;
}
