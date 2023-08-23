import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class UserCategoryModel {
    @Prop({ type: String, required: true, index: true })
    user_id: string;
    @Prop({ type: String })
    key: string;
    @Prop({ type: String })
    name: string;
    @Prop({ type: String })
    color: string;
    @Prop({ type: String })
    icon: string;
    @Prop({ type: String })
    icon_id: string;
    @Prop({ type: String })
    icon_type_id: string;
}
export const UserCategorySchema = SchemaFactory.createForClass(UserCategoryModel);
UserCategorySchema.index({ user_id: 1 })
export const USER_CATEGORY_TABLE = "user_category"