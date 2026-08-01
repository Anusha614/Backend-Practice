import{ asyncHandler }from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "./../models/user.models.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async(userId) => {
    try {

        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "something went wrong while generating refresh and access tokens")
    }
}
//register user
const registerUser = asyncHandler(async (req, res) => {

    //get user data from frontend
    //validate user data
    //check if user already exists: username or email
    //upload to cloudinary, avatar
    //create user object => create entry in db
    // remove password and refresh token fiend from response
    //check for user creation
    //return res

    
    //get user data from frontend
    
    const {fullName, email, username, password} = req.body
    
    //console.log("data: ", fullName, email, username, password )
    
    //validate user data
    if (
        [fullName, email, username, password].some((field) => 
            String(field||"").trim() ==="")
    )  {
        throw new ApiError(400, "All fields are required")
    }

    //check if user already exists: username or email
    const existedUser = await User.findOne({$or: [{username},{email}]})

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists.")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    //const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError (400, "Avatar file is reqired")
    }

    //upload to cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError (400, "Avatar file is reqired")
    }

    //create user object => create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    // remove password and refresh token fiend from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    //check for user creation
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while creating a user.")
    }

    //return res
    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully!")
    )
})



export { registerUser }

//login user
const loginUser = asyncHandler(async (req, res) => {

    // get user data
    // check if user exists(email)
    //if exists verify w password
    //if verified generate tokens
    //send cookie

    // get user data
    const {email, password} = req.body

    if (!email) {
        throw new ApiError(400, "email required")
    }

    // check if user exists(email)
    const user = await User.findOne({email})

    if (!user) {
        throw new ApiError(404, "user does not extist")
    }

    //if exists verify w password
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    //if verified generate tokens
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    //send cookie
    const options = {
        httpOnly: true,
        secure: true
    }

    const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser,accessToken
            },
            "user logged in successfully!"
        )
    )

})

export { loginUser }

//logout user
const logoutUser = asyncHandler(async (req, res) => {

    //find user
    //clear cookie and tokens
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    const loggedOutUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "user logged out successfully!"))

})

export {logoutUser}

const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken 

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }
  
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.ACCESS_TOKEN_SECRET
    )

    const user = User.findById(decodedToken?._id)

    if (!user) {
        throw new ApiError(401, "invalid refresh token")
    }

    if (incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used")
    }

    const options = {
        httpOnly: true,
        secure: true
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {accessToken, refresh}
        )
    )

})

export {refreshAccessToken}
