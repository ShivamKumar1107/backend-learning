import {asyncHandler} from '../utils/asyncHandler.js';
import  { ApiErrorHandler } from "../utils/ApiErrorHandler.js"
import User from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

import fs from 'fs';
import { response } from 'express';

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // to avoid validation error

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiErrorHandler(500, "Error generating token");
    }
}

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
        throw new ApiErrorHandler(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ email }, { username }]
    })

    if(existedUser){
        fs.unlinkSync(req.files?.avatar[0]?.path); // delete the file from local storage
        fs.unlinkSync(req.files?.coverImage[0]?.path); // delete the file from local storage
        throw new ApiErrorHandler(409, "User with email or username already exists")
    }

    // handle image upload
    const avatarLocalPath = req.files?.avatar[0]?.path;      // const avatarPath = `./uploads/avatars/${avatar.name}`;
    // const coverLocalPath = req.files?.coverImage[0]?.path;        // const coverPath = `./uploads/covers/${cover.name}`;
 
    // another way to handle image upload
    let coverLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverLocalPath = req.files?.coverImage[0]?.path;
    }

    if(!avatarLocalPath){
        throw new ApiErrorHandler(400, "Avatar is required")
    }
    // upload to cloudinary
    // const avatar = await cloudinary.uploader.upload(avatarLocalPath);
    // User.avatar = avatar.secure_url; /// or

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverLocalPath);

    if(!avatar){
        throw new ApiErrorHandler(500, "Error uploading avatar")
    }

    const user = await User.create({
        fullName,
        username,
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || null // if coverImage is not uploaded
    }); // User.create is a mongoose method used to create a new user in the database

    const createdUser = await User.findById(user._id).select("-password -refreshToken"); 
    // find the user by id to remove password and refresh token from the response
    
    if(!createdUser){
        throw new ApiErrorHandler(500, "Error creating user")
    }


    res.status(201).json(
        new ApiResponse(200, "User created successfully", createdUser)
    );
});

const test = asyncHandler(async (req, res) => {
    console.log(req.body.email);
    res.status(200).json({
        message: "Hello" + req.body.email
    });
});
// was getting error while submitting the form, the error was: "TypeError: Cannot read property 'email' of undefined", 
//the error was because i was sending form data from the frontend and i was trying to access it in the controller using req.body.email, 
//but i was not using the middleware to parse the form data, so i used the middleware to parse the form data and 
//then i was able to access the form data in the controller using req.body.email
//to parse the form data, i can use the following code in the app.js file: app.use(express.urlencoded({ extended: true })); or
//i can use multipart/form-data type while passing the form data from the frontend

const loginUser = asyncHandler(async (req, res) => {
    // get user details from frontend, request body
    // validate user details, not empty, email format, password length
    // check if user exists in the database: email or username
    // compare password
    // create token - access token, refresh token
    // save refresh token in the database
    // send cookies to the frontend
    // return response to the frontend

    const { username, email, password } = req.body;// get user details from frontend, request body


    if(!username && !email){ // validate user details, not empty, email format, password length
        throw new ApiErrorHandler(400, "All fields are required")
    }

    const user = await User.findOne({
        $or: [{ email }, { username }]
    }).then(async user => {
        if(!user){
            throw new ApiErrorHandler(404, "User not found")
        }

        const comparePassword = await user.isPasswordCorrect(password);

        if(!comparePassword){
            throw new ApiErrorHandler(401, "Invalid credentials")
        }

        // const { accessToken, refreshToken } = user.generateToken();

        // user.refreshToken = refreshToken;
        // user.save(); or 

        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);

        // res.cookie("refreshToken", refreshToken, {
        //     httpOnly: true,
        //     path: "/api/v1/users/refresh-token"
        // }); or

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly: true,
            secure: true,
        }


        // res.cookie("refreshToken", refreshToken); here "refreshToken" is the name of the cookie and refreshToken is the value of the cookie
        res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, 
                {
                user: accessToken, loggedInUser, refreshToken // or {accessToken, loggedInUser, refreshToken}
                // sending refreshToken to the frontend is not a good practice but for the devices that don't support httpOnly cookies, we can send it to the frontend
                },
                "User logged in successfully"
            )
        );
    }).catch(err => {
        throw new ApiErrorHandler(500, "Error logging in user")
    });
}); 

const logoutUser = asyncHandler(async (req, res) => {
    // clear cookies
    // return response to the frontend

    // User.findByIdAndUpdate(req.user._id, { refreshToken: "" }, { new: true }); // syntax is (id, {field: value}, {new: true}) // or

    
    await User.findByIdAndUpdate(
        req.user._id, 
        {
            $set: { refreshToken: "" }
        },
        { new: true }
    );

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(200, null, "User logged out successfully")
    );
});
// ^^^ Chronology: when user hits the logout endpoint it  goes to the route, then to the middleware, then to the controller, then to the model, then to the database, then back to the model, then to the controller, then to the middleware, then to the route, then to the frontend
// in simple words: route -> middleware -> controller -> logoutUser

const refreshAccessToken = asyncHandler(async (req, res) => {
    // get refresh token from the frontend, request body
    // check if refresh token exists in the database
    // generate new access token
    // return response to the frontend

    const { refreshToken } = req.body || req.cookies;

    if(!refreshToken){
        throw new ApiErrorHandler(401, "Unauthorized access")
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if(err){
            throw new ApiErrorHandler(401, "Unauthorized access")
        }

        const user = await User.findById(decoded._id);

        if(!user){
            throw new ApiErrorHandler(404, "User not found")
        }

        if(user?.refreshToken !== refreshToken){
            throw new ApiErrorHandler(401, "Invalid refresh token")
        }

        const { accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        }

        res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken, refreshToken: newRefreshToken
                },
                "Access token refreshed successfully"
            )
        );
    });
    // after this we need to create a route for this controller in the user.routes.js file
    // to test this, we can use postman and send a post request to the refresh token endpoint with the refresh token in the body
});

const changeCurrentUserPassword = asyncHandler(async (req, res) => {
   const {oldPassword, newPassword} = req.body;

   const user = await User.findById(req.user?.id)

   await user.isPasswordCorrect(oldPassword) // using a method predefined in user,model.js file

   if(!isPasswordCorrect){
    throw new ApiErrorHandler(400, "Invalid old password")
   }

   user.password = newPassword;
   await user.save({validateBeforeSave:false})

   return res
   .status(200)
   .json(new ApiResponse(200,{},"Password changed successfully"))

});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User details fetched successfully"))
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, username, email} = req.body;

    if([fullName, username, email].some(field => field === "")){
        throw new ApiErrorHandler(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
                $set: {
                    fullName,
                    username,
                    email
                }
        }
    , {new:true}).select("-password -refreshToken");

    // user.fullName = fullName;
    // user.username = username;
    // user.email = email;

    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Account details updated successfully"))

});

const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.files?.path;
    if(!avatarLocalPath){
        throw new ApiErrorHandler(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url){
        throw new ApiErrorHandler(500, "Error uploading avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {new:true}
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Avatar updated successfully"))

});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiErrorHandler(400, "Cover Image is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url){
        throw new ApiErrorHandler(500, "Error uploading coverImage")
    }

    const user = await User.findByIdAndUpdate(
        req.user?.id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {new:true}
    ).select("-password -refreshToken");

    return res
    .status(200)
    .json(new ApiResponse(200,user,"Cover Image updated successfully"))
});

export { registerUser, loginUser, logoutUser, test, refreshAccessToken, changeCurrentUserPassword, updateAccountDetails};