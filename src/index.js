// require("dotenv").config({ path: "./env" });

import dotenv from "dotenv";

import connectDB from "./db/index.js"; // we are using import instead of require, so in json file in scripts we will add --experimental-json-modules after nodemon and before the file name

dotenv.config({ path: "./env" }); 
// we are using import instead of require, so in json file in scripts we will add -r dotenv/config --experimental-json-modules after nodemon and before the file name

connectDB();


































/*
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app = express();

;(async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true,
            useFindAndModify: false
        });
        console.log("Database connected successfully");
        app.on("Error", (err) => {
            console.log("Error connecting to database", err);
            throw err;
        });
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.log("Error connecting to database", error);
        // throw new Error(error); or
        throw error;
    }
})() // this is a self invoking function, used to run the code inside it immediately and semi-colon is used to prevent the code from breaking
*/