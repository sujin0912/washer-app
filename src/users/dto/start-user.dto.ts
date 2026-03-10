import { IsIn, IsNotEmpty, Matches } from 'class-validator';

export class StartUserDto {
  @IsNotEmpty()
  name: string;

  @Matches(/^\d{8,10}$/)
  studentId: string;

  @Matches(/^010\d{8}$/)
  phone: string;

  @IsIn(['male', 'female'])
  gender: 'male' | 'female';
}