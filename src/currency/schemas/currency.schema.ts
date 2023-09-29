import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false })
export class CurrencyModel {
    @Prop({ type: String, required: true })
    name: string;
    @Prop({ type: Number, default: 0 })
    decimal_digits: number;
    @Prop({ type: Number, default: 0 })
    rounding: number;
    @Prop({ type: String, required: true })
    code: string;
    @Prop({ type: String, required: true })
    name_plural: string;
    @Prop({ type: String, default: "" })
    icon_class: string;
    @Prop({ type: String, default: "" })
    html_code: string;
}
export const CurrencySchema = SchemaFactory.createForClass(CurrencyModel);

export const CURRENCY_TABLE: string = "currency";