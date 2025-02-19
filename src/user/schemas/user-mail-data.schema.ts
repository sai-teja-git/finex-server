import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class UserMailDataModel {
    @Prop({ type: Object, required: true })
    data: object;

    @Prop({ type: String, required: true })
    type: string;

    @Prop({ required: true, index: { expires: 0 } })
    expires_at: Date
}

export const TimeZoneSchema = SchemaFactory.createForClass(UserMailDataModel)

export const USER_MAIL_DATA_TABLE: string = "user_mail_data";