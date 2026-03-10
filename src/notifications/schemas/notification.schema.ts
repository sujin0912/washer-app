import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: true })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ['old', 'new'] })
  building: 'old' | 'new';

  @Prop({ required: true, enum: ['washer', 'dryer'] })
  type: 'washer' | 'dryer';

  @Prop({ required: true, default: false })
  enabled: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);