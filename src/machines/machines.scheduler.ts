import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { MachinesService } from './machines.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AlertsService } from '../alerts/alerts.service';

@Injectable()
export class MachinesScheduler {
  constructor(
    private readonly machinesService: MachinesService,
    private readonly notificationsService: NotificationsService,
    private readonly alertsService: AlertsService,
  ) {}

  @Cron('*/1 * * * *')
  async handleCron() {
    const finishedMachines: any[] =
      await this.machinesService.processFinishedMachines();

    for (const machine of finishedMachines) {
      const enabledUsers = await this.notificationsService.findEnabledUsers(
        machine.building,
        machine.type,
      );

      for (const notification of enabledUsers) {
        await this.alertsService.createAlert({
          userId: String(notification.userId),
          machineId: String(machine._id),
          building: machine.building,
          type: machine.type,
          message: `${
            machine.building === 'old' ? '구관' : '신관'
          } ${machine.type === 'washer' ? '세탁기' : '건조기'} 종료 시간이 되었습니다.`,
        });
      }
    }
  }
}