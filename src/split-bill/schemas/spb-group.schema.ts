import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
class SpbGroupPersonsModel {
    @Prop({ type: String, required: true })
    name: string;
}
const SpbGroupPersonsSchema = SchemaFactory.createForClass(SpbGroupPersonsModel)

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class SpbGroupModel {
    @Prop({ type: String, required: true })
    title: string;
    @Prop({ type: Number, required: true })
    estimation: number;
    @Prop({ type: [SpbGroupPersonsSchema], default: [] })
    persons: SpbGroupPersonsModel[];
}
export const SpbGroupSchema = SchemaFactory.createForClass(SpbGroupModel);
export const SPB_GROUP_TABLE = "spb_groups"