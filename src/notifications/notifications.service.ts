import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import {
  Notification,
  NotificationDocument,
} from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async updateSetting(dto: UpdateNotificationDto) {
    const notification = await this.notificationModel.findOneAndUpdate(
      {
        userId: dto.userId,
        building: dto.building,
        type: dto.type,
      },
      {
        userId: dto.userId,
        building: dto.building,
        type: dto.type,
        enabled: dto.enabled,
      },
      {
        new: true,
        upsert: true,
      },
    );

    return {
      message: '알림 설정이 저장되었습니다.',
      notification,
    };
  }

  async findByUser(userId: string) {
    return this.notificationModel.find({ userId }).lean();
  }

  async findEnabledUsers(building: 'old' | 'new', type: 'washer' | 'dryer') {
  return this.notificationModel.find({
    building,
    type,
    enabled: true,
  }).lean();
}

}