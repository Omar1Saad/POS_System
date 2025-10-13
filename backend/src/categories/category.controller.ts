import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Category } from "./entities/category.entity";
import { CategoryService } from "./category.services";
import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { UserRole } from "src/users/entities/user.entity";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post()
  createUser(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.createCategory(createCategoryDto);
  }
  @Get()
  getUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page:number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit:number,
  )
  {
    return this.categoryService.getCategories({page, limit});
  }

  @Get(':id')
  getUserById(@Param('id') id: number): Promise<Category> {
    return this.categoryService.getCategoryById(id);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch(':id')
  updateUser(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    return this.categoryService.updateCategory(id, updateCategoryDto);
  }
  
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Delete('/bulk')
    async deleteBulk(@Body('ids') ids:number[]){
      return this.categoryService.deleteBulk(ids)
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Delete(':id')
  deleteUser(@Param('id') id: number): Promise<{}> {
    return this.categoryService.delete(id);
  }
}