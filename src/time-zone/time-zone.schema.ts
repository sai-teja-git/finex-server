import { Schema } from "mongoose";

export const TimeZoneSchema = new Schema(
    {
        zone: { type: String, require: true, unique: true },
        gmt_time: { type: String, require: true },
        gmt_minutes: { type: Number, require: true },
        name: { type: String, require: true },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
)

export const TIME_ZONE_TABLE: string = "time_zone";