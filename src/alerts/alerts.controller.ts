import { Controller, Get, Param, Patch } from '@nestjs/common';
import { AlertsService } from './alerts.service';

@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get(':userId/unread')
  getUnreadAlerts(@Param('userId') userId: string) {
    return this.alertsService.getUnreadAlerts(userId);
  }

  @Patch(':alertId/read')
  markAsRead(@Param('alertId') alertId: string) {
    return this.alertsService.markAsRead(alertId);
  }
}