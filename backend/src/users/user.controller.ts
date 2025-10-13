import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User, UserRole } from "./entities/user.entity";
import { UserService } from "./user.services";
import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";


@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  async getAll(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page:number,
      @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit:number,
  ){
      return this.userService.getUsers({ page, limit })
  }

  @Get(':id')
  getUserById(@Param('id') id: number): Promise<User> {
    return this.userService.getUserById(id);
  }

  @Patch(':id')
  updateUser(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.updateUser(id, updateUserDto);
  }

  @Delete('/bulk')
  async deleteBulk(@Body('ids') ids:number[]){
      return this.userService.deleteBulk(ids)
  }

  @Delete(':id')
  deleteUser(@Param('id') id: number): Promise<{}> {
    return this.userService.delete(id);
  }
}