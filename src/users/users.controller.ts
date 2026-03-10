import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { StartUserDto } from './dto/start-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('start')
  start(@Body() dto: StartUserDto) {
    return this.usersService.start(dto);
  }

  @Get('mypage/:userId')
  getMyPage(@Param('userId') userId: string) {
    return this.usersService.getMyPage(userId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
}