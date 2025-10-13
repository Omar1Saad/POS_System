import { UserRole } from "../entities/user.entity";
export declare class CreateUserDto {
    fullName: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
}
