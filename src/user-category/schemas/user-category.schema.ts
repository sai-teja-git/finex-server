import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class UserCategoryModel {
    @Prop({ type: String, required: true })
    user_id: string;
    @Prop({ type: String, required: true })
    key: string;
    @Prop({ type: String, required: true })
    name: string;
    @Prop({ type: String, required: true })
    icon: string;
    @Prop({ type: String, required: true })
    icon_id: string;
    @Prop({ type: String, required: true })
    icon_type_id: string;
    @Prop({ type: String, enum: ["spend", "income"], required: true })
    type: string;
}
export const UserCategorySchema = SchemaFactory.createForClass(UserCategoryModel);
UserCategorySchema.index({ user_id: 1, key: 1 }, { unique: true })
export const USER_CATEGORY_TABLE = "user_category"