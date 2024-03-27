import mongoose, {Schema, model} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary url
        default: "https://via.placeholder.com/150",
        required: true,
    },
    coverImage: {
        type: String, // cloudinary url
        default: "https://via.placeholder.com/150",
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    refreshToken: {
        type: String
    },
},
 {timestamps: true}
);

userSchema.pre("save", async function(next) { // pre save hook. before saving user to database, hash the password.
    if (!this.isModified("password")) return next(); // if password is not modified, skip hashing it.
    this.password = await bcrypt.hash(this.password, 10);
    next(); 
    // now this created a prolem that when we update the user, the password will be hashed again.
    // to solve this, we can use isModified method to check if the password is modified or not.
}); // hash password before saving user to database

userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password);
} // verify password
userSchema.methods.generateToken = function() {
    return jwt.sign(
        {
            id: this._id, 
            email: this.email, 
            username: this.username, 
            fullname: this.fullName
        }, 
        process.env.ACCESS_TOKEN_SECRET, 
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
        );
} // generate token
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            id: this._id
        }, 
        process.env.REFRESH_TOKEN_SECRET, 
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
        );
} // generate refresh token

export default model("User", userSchema);