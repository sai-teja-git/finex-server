import { Schema } from "mongoose";

export const UserSchema = new Schema(
    {
        user_name: { type: String, require: true, unique: true },
        name: { type: String, require: true },
        email: { type: String, require: true },
        password: { type: String, require: true },
        last_login: { type: Date, default: null }
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
)

export const USER_TABLE: string = "user"