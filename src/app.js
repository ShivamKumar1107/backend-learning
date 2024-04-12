import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

app.use(cors({
    // origin: process.env.CLIENT_URL,
    origin: process.env.CORS_ORIGIN, // allow to server to accept request from different origin
    credentials: true // allow session cookie from browser to pass through, even if it's coming from different origin, this is important
}));

app.use(express.json({limit: '50kb'})); 
// body-parser, reading data from body into req.body. it allows to send json data to the server and access it in req.body
app.use(express.urlencoded({ extended: true }, {limit: '50kb'})); 
// it allows to access data from url encoded form data, extended true allows to choose between parsing the url encoded data with the querystring library (when false) or the qs library (when true)
// due to extended true, it allows to parse nested object in the url encoded data

app.use(express.static('public')); // serve static files, such as images, CSS, JavaScript, etc.

app.use(cookieParser()); // parse cookie header and populate req.cookies with an object keyed by the cookie names

// routes import

import userRoutes from './routes/user.routes.js';

// routes declaration

app.use('/api/v1/users', userRoutes);
// use the userRoutes for any route that starts with /users, e.g. /users/register, /users/login, etc.
//app.use() is used to mount the specified middleware function(s) at the path which is being specified


export {app};