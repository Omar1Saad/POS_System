import { IsNotEmpty, IsString } from "class-validator";


export class CreateSupplierDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  address: string;
}