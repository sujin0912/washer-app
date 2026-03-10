import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { StartUserDto } from './dto/start-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { MachinesService } from '../machines/machines.service';
import { UsagesService } from '../usages/usages.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly machinesService: MachinesService,
    private readonly usagesService: UsagesService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async start(dto: StartUserDto) {
    const existingUser = await this.userModel.findOne({
      $or: [{ studentId: dto.studentId }, { phone: dto.phone }],
    });

    if (existingUser) {
      return existingUser;
    }

    return this.userModel.create(dto);
  }

  async findAll() {
    return this.userModel.find().lean();
  }

  async getMyPage(userId: string) {
    const user = await this.userModel.findById(userId).lean();

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    const currentUsingMachine = await this.usagesService.getCurrentByUser(userId);
    const availableCounts = await this.machinesService.getAvailableCounts();
    const notificationSettings = await this.notificationsService.findByUser(userId);

    return {
      user,
      currentUsingMachine,
      availableCounts,
      notificationSettings,
    };
  }
}