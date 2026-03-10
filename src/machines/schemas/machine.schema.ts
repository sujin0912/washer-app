import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type MachineDocument = HydratedDocument<Machine>;

@Schema({ timestamps: true })
export class Machine {
  @Prop({ required: true })
  machineNumber: number;

  @Prop({ required: true, enum: ['washer', 'dryer'] })
  type: 'washer' | 'dryer';

  @Prop({ required: true, enum: ['old', 'new'] })
  building: 'old' | 'new';

  @Prop({
    required: true,
    enum: ['available', 'in_use', 'done'],
    default: 'available',
  })
  status: 'available' | 'in_use' | 'done';

  @Prop({ requied: true, default: 0 })
  remainingMinutes: number;

@Prop({ type: Date, default: null })
expectedEndTime: Date;

  @Prop({ required: true })
  x: number;

  @Prop({ required: true })
  y: number;
}

export const MachineSchema = SchemaFactory.createForClass(Machine);