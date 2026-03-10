import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsagesService } from './usages.service';
import { StartUsageDto } from './dto/start-usage.dto';

@Controller('usages')
export class UsagesController {
  constructor(private readonly usagesService: UsagesService) {}

  @Post('start')
  start(@Body() dto: StartUsageDto) {
    return this.usagesService.start(dto);
  }

  @Post('end')
  end(@Body('machineId') machineId: string) {
    return this.usagesService.end(machineId);
  }

  @Get('current/:userId')
  getCurrentByUser(@Param('userId') userId: string) {
    return this.usagesService.getCurrentByUser(userId);
  }
}