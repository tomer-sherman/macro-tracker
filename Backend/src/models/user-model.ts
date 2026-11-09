
import { Document, model, Schema, Types } from "mongoose";



export interface IUserModel extends Document {

    _id: Types.ObjectId;
    username: string,
    password: string,

}



export const UserSchema = new Schema<IUserModel>({

    username: {
        type: String,
        required: [true, "Destination is a required field."],

    },
    password: {
        type: String,
        required: [true, "password is requeired field."]
    }
}, {
    versionKey: false,
    id: false,
})

export const UserModel = model<IUserModel>("UserModel", UserSchema, "users");



