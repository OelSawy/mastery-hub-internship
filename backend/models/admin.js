import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        default: 'admin'  // Default value for the type field
    },
    email: {
        type: String,
        required: true,
    },
    resetToken: {
        type: String,
    },
    resetTokenExpiration: {
        type: Date,
    },
});

adminSchema.pre('save', async function (next) {
    const admin = this;

    if (!admin.isModified('password')) return next();

    try {
        const saltRounds = 10;
        admin.password = await bcrypt.hash(admin.password, saltRounds);
        next();
    } catch (error) {
        next(error);
    }
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};




const Admin = mongoose.model('admin', adminSchema);
export default Admin;