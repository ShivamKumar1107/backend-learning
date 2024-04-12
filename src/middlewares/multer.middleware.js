import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) { // cb is callback function
        cb(null, "/public/temp") // null is error, if there is no error, then null is passed
    },
    filename: function (req, file, cb) { // cb is callback function
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) // generating unique file name
        // cb(null, file.fieldname + '-' + uniqueSuffix) // null is error, if there is no error, then null is passed
        cb(null, file.originalname) // null is error, if there is no error, then null is passed
    }
}); // diskStorage is used to store files on disk, destination is used to specify the folder where files will be stored, filename is used to specify the name of the file

// const upload = multer({ storage: storage }) or in es6
export const upload = multer({ storage }) // multer is used to upload files