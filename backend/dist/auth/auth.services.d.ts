import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/user.services';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UserService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        user: Partial<User>;
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: Partial<User>;
        access_token: string;
    }>;
    changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
