import { Document } from 'mongoose';

/* Creating a new interface called User that extends the Document interface. */
export interface User extends Document {
    /**
     * uniq user name for the user
     */
    user_name: string,
    /**
     * alias name of the user
     */
    name: string,
    /**
     * email of the user
     */
    email: string,
    /**
     * password of the user
     */
    password: string,
    /**
     * user last login time
     */
    last_login: Date,
}
