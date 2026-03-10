import { IsBoolean, IsIn, IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateNotificationDto {
  @IsMongoId()
  @IsNotEmpty()
  userId: string;

  @IsIn(['old', 'new'])
  building: 'old' | 'new';

  @IsIn(['washer', 'dryer'])
  type: 'washer' | 'dryer';

  @IsBoolean()
  enabled: boolean;
}