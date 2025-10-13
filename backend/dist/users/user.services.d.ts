import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { DataResponse, PaginationResponse, DeleteResponse } from "../common/types";
export declare class UserService {
    private readonly userRepository;
    constructor(userRepository: Repository<User>);
    createUser(createUserDto: CreateUserDto): Promise<User>;
    getUsers(paginationResponse: PaginationResponse): Promise<DataResponse<User>>;
    getUserById(id: number): Promise<User>;
    getByEmail(email: string): Promise<User | null>;
    updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User>;
    private validateUniqueFields;
    private updateUserFields;
    updatePassword(id: number, hashedNewPassword: string): Promise<User>;
    deleteBulk(ids: number[]): Promise<DeleteResponse>;
    delete(id: number): Promise<{
        success: string;
    }>;
}
