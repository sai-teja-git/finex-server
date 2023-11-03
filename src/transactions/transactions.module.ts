import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { USER_CREDITS_TABLE, UserCreditsSchema } from './schemas/user-credits.schema';
import { USER_DEBITS_TABLE, UserDebitsSchema } from './schemas/user-debits.schema';
import { USER_ESTIMATIONS_TABLE, UserEstimationsSchema } from './schemas/user-estimations.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: USER_CREDITS_TABLE,
        schema: UserCreditsSchema
      },
      {
        name: USER_DEBITS_TABLE,
        schema: UserDebitsSchema
      },
      {
        name: USER_ESTIMATIONS_TABLE,
        schema: UserEstimationsSchema
      }
    ])
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [MongooseModule]
})
export class TransactionsModule { }
