import { Module } from '@nestjs/common';
import { ColorsService } from './colors.service';
import { ColorsController } from './colors.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { COLORS_TABLE, colorsSchema } from './colors.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COLORS_TABLE, schema: colorsSchema }
    ])
  ],
  controllers: [ColorsController],
  providers: [ColorsService]
})
export class ColorsModule { }
