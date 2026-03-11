export class MachineResponseDto {
  machineId: string;
  machineNumber: number;

  type: 'washer' | 'dryer';

  building: 'old' | 'new';

  status: 'available' | 'in_use' | 'done';

  remainingMinutes: number;
  expectedEndTime?: string | null;
}
