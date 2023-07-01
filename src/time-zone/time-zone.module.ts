import { Module } from '@nestjs/common';
import { TimeZoneService } from './time-zone.service';
import { TimeZoneController } from './time-zone.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TIME_ZONE_TABLE, TimeZoneSchema } from './time-zone.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: TIME_ZONE_TABLE, schema: TimeZoneSchema }])
  ],
  controllers: [TimeZoneController],
  providers: [TimeZoneService]
})
export class TimeZoneModule { }
