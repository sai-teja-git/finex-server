import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class ColorModel {
    @Prop({ type: String, required: true, unique: true })
    hex_code: string;
}
export const ColorSchema = SchemaFactory.createForClass(ColorModel);

export const COLORS_TABLE = "color"