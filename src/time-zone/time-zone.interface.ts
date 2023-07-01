import { Document } from 'mongoose';

/* Creating a new interface called TimeZone that extends the Document interface. */
export interface TimeZone extends Document {
    /**
     * uniq zone name
     */
    zone: string,
    /**
     * name of the zone
     */
    name: string,
    /**
     * gmt time of the time zone
     */
    gmt_time: string,
}
