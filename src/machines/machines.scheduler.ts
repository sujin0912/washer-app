import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MachinesService } from './machines.service';

@Injectable()
export class MachinesScheduler {
  constructor(private readonly machinesService: MachinesService) {}

  @Cron('*/1 * * * *')
  async handleCron() {
    await this.machinesService.updateRemainingTimes();
  }
}