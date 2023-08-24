import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { IconObject } from "../icons.interface"

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class IconModel {
    @Prop({ type: String, required: true, unique: true })
    key: string;
    @Prop({ type: String, required: true, unique: true })
    name: string;
    @Prop({ type: String })
    icon: string;
}
export const IconSchema = SchemaFactory.createForClass(IconModel)

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class IconGroupModel {
    @Prop({ type: String, required: true, unique: true })
    type: string;
    @Prop({ type: String, required: true, unique: true })
    alias: string;
    @Prop({ type: [IconSchema], default: [] })
    icons: IconObject[];
}
export const IconGroupSchema = SchemaFactory.createForClass(IconGroupModel)

export const ICONS_TABLE = "icon"