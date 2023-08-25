
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    username: String,
    password: String,
    tokenId: String
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String
})

export const Admin = mongoose.models.Admin || mongoose.model('Admin', adminSchema);
export const User = mongoose.models.UserAuth || mongoose.model('UserAuth', userSchema);