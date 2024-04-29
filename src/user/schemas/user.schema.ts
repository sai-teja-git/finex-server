
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class UserModel {
    @Prop({ type: String, required: true, unique: true })
    user_name: string;
    @Prop({ type: String, required: true })
    name: string;
    @Prop({ type: String, required: true })
    email: string;
    @Prop({ type: String, default: null })
    password: string;
    @Prop({ type: String, enum: ["dark", "light", "system"], default: "system" })
    theme: string;
    @Prop({ type: String, default: null })
    profile_image: string;
    @Prop({ type: Date, default: null })
    last_login: Date;
    @Prop({ type: Boolean, default: false })
    verified: boolean;
    @Prop({ type: String, required: true })
    time_zone_id: string;
    @Prop({ type: String, required: true })
    time_zone: string;
    @Prop({ type: String, required: true })
    time_zone_gmt_time: string;
    @Prop({ type: Number, required: true })
    time_zone_gmt_minutes: number;
    @Prop({ type: String, required: true })
    currency_id: string;
    @Prop({ type: String, required: true })
    currency_name: string;
    @Prop({ type: String, required: true })
    currency_name_plural: string;
    @Prop({ type: Number, required: true })
    currency_decimal_digits: number;
    @Prop({ type: String, required: true })
    currency_code: string;
    @Prop({ type: String })
    currency_icon_class: string;
    @Prop({ type: String })
    currency_html_code: string;
}

export const UserSchema = SchemaFactory.createForClass(UserModel)

export const USER_TABLE: string = "user"