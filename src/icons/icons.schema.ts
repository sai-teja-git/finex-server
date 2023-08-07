import { Schema } from "mongoose";

const iconObjectSchema = new Schema(
    {
        key: { type: String, unique: true },
        name: { type: String, unique: true },
        icon: { type: String }
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
)

export const iconsSchema = new Schema(
    {
        type: { type: String, unique: true },
        alias: { type: String, unique: true },
        icons: { type: [iconObjectSchema] }
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
)

export const ICONS_TABLE = "icon"