import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { MachinesService } from './machines.service';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Post('seed')
  seed() {
    return this.machinesService.seed();
  }

  @Get('available-counts')
  getAvailableCounts() {
    return this.machinesService.getAvailableCounts();
  }

@Get('map')
getMapData(@Query('building') building?: string) {
  return this.machinesService.getMapData(building);
}

@Get(':machineid/time')
  getUnreadAlerts(@Param('machineid') machineid: string) {
    return this.machinesService.getUnreadMachines(machineid);
  }

  @Get()
  findAll(
    @Query('building') building?: string,
    @Query('type') type?: string,
  ) {
    return this.machinesService.findAll(building, type);
  }

}