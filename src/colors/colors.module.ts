import { Module } from '@nestjs/common';
import { ColorsService } from './colors.service';
import { ColorsController } from './colors.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { COLORS_TABLE, ColorSchema } from './schemas/colors.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: COLORS_TABLE, schema: ColorSchema }
    ])
  ],
  controllers: [ColorsController],
  providers: [ColorsService]
})
export class ColorsModule { }
