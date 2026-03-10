import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type UsageDocument = HydratedDocument<Usage>;

@Schema({ timestamps: true })
export class Usage {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Machine', required: true })
  machineId: Types.ObjectId;

  @Prop({ required: true, enum: ['using', 'done'], default: 'using' })
  status: 'using' | 'done';

  @Prop({ type: Date, required: true })
  startTime: Date;

  @Prop({ type: Date, default: null })
  endTime: Date;
}

export const UsageSchema = SchemaFactory.createForClass(Usage);