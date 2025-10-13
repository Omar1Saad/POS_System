import { In, Repository } from "typeorm";
import { User, UserRole } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from "./dto/update-user.dto";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataResponse, PaginationResponse, DeleteResponse } from "../common/types";

export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { fullName, username, email, password, role } = createUserDto;
    const userExists = await this.userRepository.findOne({ where: { username } });
    if (userExists) {
      throw new BadRequestException('Username already exists');
    }
    const emailExists = await this.userRepository.findOne({ where: { email } });
    if (emailExists) {
      throw new BadRequestException('Email already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
        fullName,
        username,
        email,
        password:hashedPassword,
        role:role ?? UserRole.CASHIER,
    });
    return this.userRepository.save(user);
  }

  async getUsers(paginationResponse:PaginationResponse): Promise<DataResponse<User>> {
      const { page, limit } = paginationResponse;
      const skip = (page - 1) * limit;
      const take = limit;
      const [users, total] = await this.userRepository.findAndCount({ skip, take});
      return { 
        data:users, 
        total ,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }  

  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async getByEmail(email:string){
    const user = await this.userRepository.findOne({ where: { email } });
    return user
  }
  
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const { username, email } = updateUserDto;
    
    await this.validateUniqueFields(id, username, email);
    const user = await this.getUserById(id);
    this.updateUserFields(user, updateUserDto);
    
    return this.userRepository.save(user);
  }

  private async validateUniqueFields(id: number, username?: string, email?: string): Promise<void> {
    if (username) {
      const userExists = await this.userRepository.findOne({ where: { username } });
      if (userExists && userExists.id !== +id) {
        throw new BadRequestException('Username already exists');
      }
    }
    
    if (email) {
      const emailExists = await this.userRepository.findOne({ where: { email } });
      if (emailExists && emailExists.id !== +id) {
        throw new BadRequestException('Email already exists');
      }
    }
  }

  private async updateUserFields(user: User, updateUserDto: UpdateUserDto): Promise<void> {
    const { fullName, username, email, password, role } = updateUserDto;
    
    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);
    if (role) user.role = role;
  }

  async updatePassword(id:number, hashedNewPassword:string):Promise<User>{
    const user = await this.userRepository.findOne({ where: { id } });
    if(!user){
      throw new NotFoundException("User not found!")
    }
    user.password = hashedNewPassword
    return this.userRepository.save(user);
  }

  async deleteBulk(ids:number[]):Promise<DeleteResponse>{
    const users = await this.userRepository.findBy({ id: In(ids) });
    if(users.length !== ids.length){
      throw new NotFoundException("One or more users not found!")
    }
    await this.userRepository.delete(ids)
    return {'message':'Users deleted successfully!'}
  }
  
  async delete(id:number){
    const userExists = await this.userRepository.findOne({where:{id}})
    if(!userExists){
      throw new NotFoundException('User not found!')
    }
    await this.userRepository.delete(id)
    return {"success":"User deleted successfully!"}
  }
}