import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { MAIL_TYPES } from "src/constants/mail-data.const";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class UserMailDataModel {
    @Prop({ type: Object, required: true })
    data: object;

    @Prop({ type: String, required: true, enum: Object.values(MAIL_TYPES) })
    type: string;

    @Prop({ required: true, index: { expires: 0 } })
    expires_at: Date
}

export const UserMailDataSchema = SchemaFactory.createForClass(UserMailDataModel)

export const USER_MAIL_DATA_TABLE: string = "user_mail_data";