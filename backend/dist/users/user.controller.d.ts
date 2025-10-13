import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User } from "./entities/user.entity";
import { UserService } from "./user.services";
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    createUser(createUserDto: CreateUserDto): Promise<User>;
    getAll(page: number, limit: number): Promise<import("../common/types").DataResponse<User>>;
    getUserById(id: number): Promise<User>;
    updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User>;
    deleteBulk(ids: number[]): Promise<import("../common/types").DeleteResponse>;
    deleteUser(id: number): Promise<{}>;
}
