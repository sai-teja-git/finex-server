import { Schema } from "mongoose";

export const colorsSchema = new Schema(
    {
        color: { type: String, unique: true }
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
)

export const COLORS_TABLE = "color"