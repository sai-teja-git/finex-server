import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class CategoryModel {
    @Prop({ type: String, required: true })
    key: string;
    @Prop({ type: String, required: true })
    name: string;
    @Prop({ type: String, required: true })
    color: string;
    @Prop({ type: String, required: true })
    icon: string;
    @Prop({ type: String, required: true })
    icon_id: string;
    @Prop({ type: String, required: true })
    icon_type_id: string;
    @Prop({ type: String, enum: ["spend", "income"], required: true })
    type: string;
}
export const CategorySchema = SchemaFactory.createForClass(CategoryModel);
export const CATEGORY_TABLE = "category"