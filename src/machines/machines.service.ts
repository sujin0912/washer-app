import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Machine, MachineDocument } from './schemas/machine.schema';
import { MachineResponseDto } from './dto/machine-response.dto';

@Injectable()
export class MachinesService {
  constructor(
    @InjectModel(Machine.name) private machineModel: Model<MachineDocument>,
  ) {}

  private getRemainingMinutes(expectedEndTime?: Date | null): number {
    if (!expectedEndTime) return 0;

    const now = Date.now();
    const end = new Date(expectedEndTime).getTime();
    const diffMs = end - now;

    if (diffMs <= 0) return 0;

    return Math.ceil(diffMs / 60000);
  }

  private roundToNearest10Minutes(minutes: number): number {
    return Math.round(minutes / 10) * 10;
  }

private formatDisplayTime(minutes: number): string {
  if (minutes <= 0) return '사용 종료';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours}시간 ${mins}분`;
  }

  if (hours > 0) {
    return `${hours}시간`;
  }

  return `${mins}분`;
}

  async processFinishedMachines(): Promise<any[]> {
    const machines = await this.machineModel.find({
      status: 'in_use',
      expectedEndTime: { $ne: null },
    });

    const finishedMachines: any[] = [];

    for (const machine of machines) {
      if (!machine.expectedEndTime) continue;

      const now = Date.now();
      const end = new Date(machine.expectedEndTime).getTime();

      if (end <= now) {
        machine.status = 'available';
        machine.remainingMinutes = 0;
        await machine.save();

        finishedMachines.push(machine);
      }
    }

    return finishedMachines;
  }

  async findAll(
    building?: string,
    type?: string,
  ): Promise<MachineResponseDto[]> {
    const filter: any = {};

    if (building) filter.building = building;
    if (type) filter.type = type;

    const machines = await this.machineModel
      .find(filter)
      .sort({ building: 1, machineNumber: 1 })
      .lean();

    return machines.map((machine) => {
      const rawRemaining =
        machine.status === 'in_use'
          ? this.getRemainingMinutes(machine.expectedEndTime)
          : 0;

      const roundedRemaining =
        machine.status === 'in_use'
          ? this.roundToNearest10Minutes(rawRemaining)
          : 0;

      return {
        machineId: String(machine._id),
        machineNumber: machine.machineNumber,
        type: machine.type,
        building: machine.building,
        status: machine.status,
        remainingMinutes: roundedRemaining,
        expectedEndTime: machine.expectedEndTime
          ? new Date(machine.expectedEndTime).toISOString()
          : null,
      };
    });
  }

  async getAvailableCounts() {
    const oldDryer = await this.machineModel.countDocuments({
      building: 'old',
      type: 'dryer',
      status: 'available',
    });

    const oldWasher = await this.machineModel.countDocuments({
      building: 'old',
      type: 'washer',
      status: 'available',
    });

    const newDryer = await this.machineModel.countDocuments({
      building: 'new',
      type: 'dryer',
      status: 'available',
    });

    const newWasher = await this.machineModel.countDocuments({
      building: 'new',
      type: 'washer',
      status: 'available',
    });

    return {
      oldDryer,
      oldWasher,
      newDryer,
      newWasher,
    };
  }

  async seed() {
    const count = await this.machineModel.countDocuments();

    if (count > 0) {
      return { message: '이미 기기 데이터가 있습니다.' };
    }

    await this.machineModel.insertMany([
      {
        machineNumber: 1,
        type: 'washer',
        building: 'old',
        status: 'available',
        remainingMinutes: 0,
        x: 100,
        y: 120,
      },
      {
        machineNumber: 2,
        type: 'washer',
        building: 'old',
        status: 'in_use',
        remainingMinutes: 15,
        x: 160,
        y: 120,
      },
      {
        machineNumber: 1,
        type: 'dryer',
        building: 'new',
        status: 'available',
        remainingMinutes: 0,
        x: 100,
        y: 220,
      },
      {
        machineNumber: 2,
        type: 'dryer',
        building: 'new',
        status: 'done',
        remainingMinutes: 0,
        x: 160,
        y: 220,
      },
    ]);

    return { message: '기기 더미 데이터가 저장되었습니다.' };
  }

  async getMapData(building?: string) {
    const filter: any = {};

    if (building) {
      filter.building = building;
    }

    const machines = await this.machineModel
      .find(filter)
      .sort({ machineNumber: 1 })
      .lean();

    return {
      building: building || 'all',
      buildingLabel:
        building === 'old'
          ? '구관'
          : building === 'new'
          ? '신관'
          : '전체',
      machines: machines.map((machine) => ({
        machineId: String(machine._id),
        machineNumber: machine.machineNumber,
        type: machine.type,
        typeLabel: machine.type === 'washer' ? '세탁기' : '건조기',
        status: machine.status,
        statusLabel:
          machine.status === 'available'
            ? '사용 가능'
            : machine.status === 'in_use'
            ? '사용 중'
            : '사용 완료',
        x: machine.x,
        y: machine.y,
      })),
    };
  }

  getDefaultMinutes() {
    return 120;
  }

  async startMachine(machineId: string) {
    const machine = await this.machineModel.findById(machineId);

    if (!machine) {
      throw new Error('기기를 찾을 수 없습니다.');
    }

    const defaultMinutes = this.getDefaultMinutes();
    const startedAt = new Date();
    const expectedEndTime = new Date(
      startedAt.getTime() + defaultMinutes * 60 * 1000,
    );

    machine.status = 'in_use';
    machine.startedAt = startedAt;
    machine.remainingMinutes = defaultMinutes;
    machine.expectedEndTime = expectedEndTime;

    await machine.save();

    return machine;
  }

  async finishMachine(machineId: string) {
    const machine = await this.machineModel.findById(machineId);

    if (!machine) {
      throw new Error('기기를 찾을 수 없습니다.');
    }

    machine.status = 'done';
    machine.remainingMinutes = 0;
    machine.startedAt = null as any;
    machine.expectedEndTime = null as any;

    await machine.save();

    return machine;
  }

  async updateRemainingTimes() {
    const machines = await this.machineModel.find({ status: 'in_use' });

    for (const machine of machines) {
      if (!machine.expectedEndTime) continue;

      const rawRemaining = this.getRemainingMinutes(machine.expectedEndTime);
      const roundedRemaining = this.roundToNearest10Minutes(rawRemaining);

      machine.remainingMinutes = roundedRemaining;

      if (rawRemaining === 0) {
        machine.status = 'done';
      }

      await machine.save();
    }
  }

  async getUnreadMachines(machineid: string) {
  const machine = await this.machineModel.findById(machineid).lean();

  if (!machine) {
    throw new Error('기기를 찾을 수 없습니다.');
  }

  // let rawRemaining = 0;
  // let roundedRemaining = 0;
  // let displayTime = '사용 가능';

  // if (machine.status === 'in_use' && machine.expectedEndTime) {
  //   rawRemaining = this.getRemainingMinutes(machine.expectedEndTime);
  //   roundedRemaining = this.roundToNearest10Minutes(rawRemaining);
  //   displayTime = this.formatDisplayTime(roundedRemaining);
  // }

  // if (machine.status === 'done') {
  //   displayTime = '사용 종료';
  // }

  // if (machine.status === 'available') {
  //   displayTime = '사용 가능';
  // }

  return {
    machineNumber: machine.machineNumber,
    type : machine.type,
    building: machine.building,
    status: machine.status,
    remainingMinutes: machine.remainingMinutes,
  };

  // return {
  //   machineNumber: machine.machineNumber,
  //   type: machine.type,
  //   building: machine.building,
  //   status: machine.status,
  //   remainingMinutes: roundedRemaining,
  //   displayTime,
  // };
  }
}