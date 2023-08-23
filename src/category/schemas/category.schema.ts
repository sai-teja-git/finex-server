import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class CategoryModel {
    @Prop({ type: String, required: true })
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
export const CategorySchema = SchemaFactory.createForClass(CategoryModel);
export const CATEGORY_TABLE = "user_category"