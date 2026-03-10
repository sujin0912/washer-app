import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsagesController } from './usages.controller';
import { UsagesService } from './usages.service';
import { Usage, UsageSchema } from './schemas/usage.schema';
import { Machine, MachineSchema } from '../machines/schemas/machine.schema';
import { AlertsModule } from '../alerts/alerts.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Usage.name, schema: UsageSchema },
      { name: Machine.name, schema: MachineSchema },
    ]),
    
    AlertsModule,
    NotificationsModule,

  ],
  controllers: [UsagesController],
  providers: [UsagesService],
  exports: [UsagesService],
})
export class UsagesModule {}