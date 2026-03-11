import { BadRequestException, Injectable, NotFoundException,} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Usage, UsageDocument } from './schemas/usage.schema';
import { StartUsageDto } from './dto/start-usage.dto';
import { Machine, MachineDocument } from '../machines/schemas/machine.schema';
import { AlertsService } from '../alerts/alerts.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsagesService {
 constructor(
  @InjectModel(Usage.name)
  private usageModel: Model<UsageDocument>,

  @InjectModel(Machine.name)
  private machineModel: Model<MachineDocument>,
  private readonly alertsService: AlertsService,
  private readonly notificationsService: NotificationsService,
) {}

  async start(dto: StartUsageDto) {
    const machine = await this.machineModel.findById(dto.machineId);

    if (!machine) {
      throw new NotFoundException('기기를 찾을 수 없습니다.');
    }

    if (machine.status === 'in_use') {
      throw new BadRequestException('이미 사용 중인 기기입니다.');
    }

  const startedAt = new Date();
  const expectedEndTime = new Date(startedAt.getTime() + 120 * 60 * 1000);

  machine.status = 'in_use';
  machine.startedAt = startedAt;
  machine.expectedEndTime = expectedEndTime;
  machine.remainingMinutes = 120;
  await machine.save();

   const usage = await this.usageModel.create({
  userId: dto.userId,
  machineId: dto.machineId,
  status: 'using',
  startTime: new Date(),
  });

    return {
      message: '기기 사용 시작',
      usage,
    };
  }

  async end(machineId: string) {
    const machine = await this.machineModel.findById(machineId);

    if (!machine) {
      throw new NotFoundException('기기를 찾을 수 없습니다.');
    }

    const usage = await this.usageModel.findOne({
      machineId,
      status: 'using',
    });

    if (!usage) {
      throw new NotFoundException('현재 사용 중인 기록이 없습니다.');
    }

    usage.status = 'done';
    usage.endTime = new Date();
    await usage.save();

  machine.status = 'done';
  machine.remainingMinutes = 0;
  machine.startedAt = null as any;
  machine.expectedEndTime = null as any;
  await machine.save();

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
      } ${machine.type === 'washer' ? '세탁기' : '건조기'} 사용 가능한 기기가 있습니다.`,
    });
  }

    return {
      message: '기기 사용 종료',
    };
  }

  async getCurrentByUser(userId: string) {
    const usage = await this.usageModel
      .findOne({
        userId,
        status: 'using',
      })
      .sort({ createdAt: -1 })
      .lean();

    if (!usage) {
      return null;
    }

    const machine = await this.machineModel.findById(usage.machineId).lean();

    if (!machine) {
      return null;
    }

    return {
      machineId: String(machine._id),
      machineNumber: machine.machineNumber,
      type: machine.type,
      building: machine.building,
      status: machine.status,
      remainingMinutes: machine.remainingMinutes,
      x: machine.x,
      y: machine.y,
      startTime: usage.startTime,
    };
  }
}