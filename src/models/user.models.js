import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema( 
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowecase: true,
            trim: true,
            index: true
        },
        password: {
            type: string,
            required: [true, 'password is required']
        },
        email: {
            type: string,
            required: true,
            unique: true,
            lowecase: true,
            trim: true
        },
        fullname: {
            type: string,
            required: true,
            unique: true,
            trim: true
        },
        avatar: {
            type: string,
            required: true
        },
        coverImage: {
            type: string
        },
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        refreshToken: {
            type: string
        }
    }, { timestamps: true})

    userSchema.pre("save", async function(next) {
        if (!this.modifiedPassword) return next();

        this.password = await bcrypt.hash(this.password, 10)
        next()
    })

    userSchema.methods.isPasswordCorrect = async function(password) {
        return await bcrypt.compare(password, this.password)
    }

    userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id, 
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


    export const User = mongoose.model("User", userSchema)