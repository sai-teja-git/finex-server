import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class TimeZoneModel {
    @Prop({ type: String, required: true, unique: true })
    zone: string;
    @Prop({ type: String, required: true })
    gmt_time: string;
    @Prop({ type: String, required: true })
    name: string;
    @Prop({ type: Number, required: true })
    gmt_minutes: number;
}

export const TimeZoneSchema = SchemaFactory.createForClass(TimeZoneModel)

export const TIME_ZONE_TABLE: string = "time_zone";