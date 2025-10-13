import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from './auth.services';
import { User } from 'src/users/entities/user.entity';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        user: Partial<User>;
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: Partial<User>;
        access_token: string;
    }>;
    changePassword(user: User, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    profile(user: User): Promise<any>;
}
