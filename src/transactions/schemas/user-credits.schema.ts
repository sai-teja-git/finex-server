import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class UserCreditsModel {
    @Prop({ type: String, required: true, index: true })
    user_id: string;
    @Prop({ type: String, required: true })
    category_id: string;
    @Prop({ type: Number, required: true })
    value: number;
    @Prop({ type: String, required: true })
    remarks: string;
}
export const UserCreditsSchema = SchemaFactory.createForClass(UserCreditsModel);
export const USER_CREDITS_TABLE = "user_credit"