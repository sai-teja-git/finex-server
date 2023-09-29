import { Module } from '@nestjs/common';
import { IconsService } from './icons.service';
import { IconsController } from './icons.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ICONS_TABLE, IconGroupSchema } from './schemas/icons.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ICONS_TABLE,
        schema: IconGroupSchema
      }
    ])
  ],
  controllers: [IconsController],
  providers: [IconsService]
})
export class IconsModule { }
