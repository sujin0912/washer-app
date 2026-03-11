import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MachinesController } from './machines.controller';
import { MachinesService } from './machines.service';
import { Machine, MachineSchema } from './schemas/machine.schema';
import { MachinesScheduler } from './machines.scheduler';
import { NotificationsModule } from '../notifications/notifications.module';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Machine.name, schema: MachineSchema },
    ]),
    NotificationsModule,
    AlertsModule,
  ],
  controllers: [MachinesController],
  providers: [MachinesService, MachinesScheduler],
  exports: [MachinesService, MongooseModule],
})
export class MachinesModule {}