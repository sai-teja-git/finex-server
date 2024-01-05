import { Module } from '@nestjs/common';
import { SplitBillService } from './split-bill.service';
import { SplitBillController } from './split-bill.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { SPB_GROUP_TABLE, SpbGroupSchema } from './schemas/spb-group.schema';
import { SPB_BILL_TABLE, SpbBillSchema } from './schemas/spb-bills.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: SPB_GROUP_TABLE,
        schema: SpbGroupSchema
      },
      {
        name: SPB_BILL_TABLE,
        schema: SpbBillSchema
      }
    ])
  ],
  controllers: [SplitBillController],
  providers: [SplitBillService]
})
export class SplitBillModule { }
