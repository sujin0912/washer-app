import { IsMongoId, IsNotEmpty } from 'class-validator';

export class StartUsageDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsMongoId()
  @IsNotEmpty()
  machineId: string;
}