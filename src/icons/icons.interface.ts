import { Document } from "mongoose";

/**
 * interface for the each icon object inside the type
 */
export interface IconObject extends Document {
    key: string,
    name: string,
    icon: string
}

/**
 * interface for the type of data for the icons
 */
export interface Icon extends Document {
    type: string,
    alias: string,
    icons: IconObject[]
}