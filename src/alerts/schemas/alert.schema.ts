import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AlertDocument = HydratedDocument<Alert>;

@Schema({ timestamps: true })
export class Alert {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Machine', required: true })
  machineId: Types.ObjectId;

  @Prop({ required: true, enum: ['old', 'new'] })
  building: 'old' | 'new';

  @Prop({ required: true, enum: ['washer', 'dryer'] })
  type: 'washer' | 'dryer';

  @Prop({ required: true })
  message: string;

  @Prop({ required: true, default: false })
  isRead: boolean;
}

export const AlertSchema = SchemaFactory.createForClass(Alert);

//asdfjkwqkfpoasdklf