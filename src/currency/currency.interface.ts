import { Document } from 'mongoose';

/* Creating a new interface called TimeZone that extends the Document interface. */
export interface Currency extends Document {
    /**
     * name of the zone
     */
    name: string,
    /**
     * how many digits we can show after decimal point
     */
    decimal_digits: number,
    /**
     * rounding number
     */
    rounding: number,
    /**
     * code for the currency
     */
    code: string,
    /**
     * plural name for the currency
     */
    name_plural: string,
    /**
     * icon class of currency
     */
    icon_class: string,
    /**
     * html code of currency
     */
    html_code: string,

}
