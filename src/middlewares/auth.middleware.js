import { ApiErrorHandler } from "../utils/ApiErrorHandler.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, _, next) => { // replace res with _ because we are not using res
   try{
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if(!token){
        throw new ApiErrorHandler(401, "Unauthorized");
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log(decoded);
    // req.user = await User.findById(decoded?._id).select("-password -refreshToken"); 
    const user = await User.findById(decoded?._id).select("-password -refreshToken");
    console.log(user);
    if(!user){
        // Discuss about frontend
        throw new ApiErrorHandler(401, "Invalid Access Token___");
    }
    req.user = user;
    next();
   } catch(err){
       throw new ApiErrorHandler(401, err?.message || "Invalid Access Token...");
   }
});