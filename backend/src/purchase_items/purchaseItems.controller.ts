import { Body, Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { CreatePurchaseItemsDto } from "./dto/create-purchaseItems.dto";
import { UpdatePurchaseItemsDto } from "./dto/update-purchaseItems.dto";
import { PurchaseItemsService } from "./purchaseItems.services";
import { RolesGuard } from "src/auth/guards/roles.guard";
import { UserRole } from "src/users/entities/user.entity";
import { Roles } from "src/auth/decorators/roles.decorator";
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.MANAGER)
@Controller('purchase-Items')
export class PurchaseItemsController {
    constructor( private readonly purchaseItemsService: PurchaseItemsService ) {}
    
    @Post()
    create(@Body() createPurchaseItemsDto: CreatePurchaseItemsDto) {
        return this.purchaseItemsService.createPurchaseItems(createPurchaseItemsDto);
    }

    @Get()
    findAll(
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page:number,
        @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit:number,
    ) {
        return this.purchaseItemsService.getPurchaseItems({page, limit});
    }
    
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.purchaseItemsService.getPurchaseItemsById(id);
    }

    @Patch(':id')
    update(@Param('id') id: number, @Body() updatePurchaseItemsDto: UpdatePurchaseItemsDto) {
        return this.purchaseItemsService.updatePurchaseItems(id, updatePurchaseItemsDto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.purchaseItemsService.delete(id);
    }

    @Post('bulk')
    createBulk(@Body() createPurchaseItemsDto: CreatePurchaseItemsDto[]) {
        return this.purchaseItemsService.createBulkPurchaseItems(createPurchaseItemsDto);
    }
}