import { Schema } from "mongoose";

export const CurrencySchema = new Schema(
    {
        name: { type: String, require: true },
        decimal_digits: { type: Number, default: 0 },
        rounding: { type: Number, default: 0 },
        code: { type: String, require: true },
        name_plural: { type: String, require: true },
        icon_class: { type: String, default: "" },
        html_code: { type: String, default: "" },
    },
    {
        timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
    }
)

export const CURRENCY_TABLE: string = "currency";