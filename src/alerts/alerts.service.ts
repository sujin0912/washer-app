import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert, AlertDocument } from './schemas/alert.schema';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  constructor(
    @InjectModel(Alert.name)
    private alertModel: Model<AlertDocument>,
   ) {}

  async createAlert(data: {
    userId: string;
    machineId: string;
    building: 'old' | 'new';
    type: 'washer' | 'dryer';
    message: string;
  }) {
    const existingUnread = await this.alertModel.findOne({
      userId: data.userId,
      machineId: data.machineId,
      isRead: false,
    });

    if (existingUnread) {
      return existingUnread;
    }

    return this.alertModel.create({
      userId: data.userId,
      machineId: data.machineId,
      building: data.building,
      type: data.type,
      message: data.message,
      isRead: false,
    });
  }

  async getUnreadAlerts(userId: string) {
    this.logger.log(userId);
    return this.alertModel
      .find({ userId, isRead: false })
      .sort({ createdAt: -1 })
      .lean();
  }

  async markAsRead(alertId: string) {
    const alert = await this.alertModel.findById(alertId);

    if (!alert) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }

    alert.isRead = true;
    await alert.save();

    return {
      message: '알림을 읽음 처리했습니다.',
      alert,
    };
  }
}