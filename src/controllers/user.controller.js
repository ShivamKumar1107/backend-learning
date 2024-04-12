import {asyncHandler} from '../utils/asyncHandler.js';
import  { ApiErrorHandler } from "../utils/ApiErrorHandler.js"
import { User } from "../models/User.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend, request body
    // validate user details, not empty, email format, password length
    // check if user already exists in the database: email, username
    // check for images, avatar
    // upload images to cloudinary, avatar
    // create user object - create entry in the database
    // remove password and refresh token field from the response
    // check for user creation
    // return response to the frontend

    const { fullName, username, email, password } = req.body;

    console.log(fullName);

    // if(fullName===""){
    //     throw ApiErrorHandler(400, "Full Name is Required")
    // } or professional approach

    if([fullName, username, email, password].some(field => field === "")){
        throw ApiErrorHandler(400, "All fields are required")
    }

    const existedUser = User.findOne({
        $or: [{ email }, { username }]
    })

    if(existedUser){
        throw ApiErrorHandler(409, "User with email or username already exists")
    }

    // handle image upload
    const avatarLocalPath = req.files?.avatar[0]?.path;      // const avatarPath = `./uploads/avatars/${avatar.name}`;
    const coverLocalPath = req.files?.coverImage[0]?.path;        // const coverPath = `./uploads/covers/${cover.name}`;

    if(!avatarLocalPath){
        throw ApiErrorHandler(400, "Avatar is required")
    }
    // upload to cloudinary
    // const avatar = await cloudinary.uploader.upload(avatarLocalPath);
    // User.avatar = avatar.secure_url; /// or

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if(!avatar){
        throw ApiErrorHandler(500, "Error uploading avatar")
    }

    const user = await User.create({
        fullName,
        username,
        email,
        password,
        avatar: avatar.secure_url,
        coverImage: coverImage.secure_url || null // if coverImage is not uploaded
    }); // User.create is a mongoose method used to create a new user in the database

    const createdUser = await User.findById(user._id).select("-password -refreshToken"); 
    // find the user by id to remove password and refresh token from the response
    
    if(!createdUser){
        throw ApiErrorHandler(500, "Error creating user")
    }


    res.status(201).json(
        new ApiResponse(200, "User created successfully", createdUser)
    );
});

export { registerUser };