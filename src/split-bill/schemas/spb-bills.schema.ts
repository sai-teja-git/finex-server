import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
class SpbPersonBillModel {
    @Prop({ type: String, required: true })
    person_id: string;
    @Prop({ type: Number })
    value: number;
}
const SpbPersonBillSchema = SchemaFactory.createForClass(SpbPersonBillModel)

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class SpbBillModel {
    @Prop({ type: String, required: true })
    group_id: string;
    @Prop({ type: String, required: true })
    name: string;
    @Prop({ type: Number, required: true })
    value: number;
    @Prop({ type: Array, default: [] })
    persons: SpbPersonBillModel[];
}
export const SpbBillSchema = SchemaFactory.createForClass(SpbBillModel);
export const SPB_BILL_TABLE = "spb_bills";