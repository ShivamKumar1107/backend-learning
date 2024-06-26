import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {resource_type: "auto"});
        // file uploaded successfully
        console.log("File uploaded successfully");
        fs.unlinkSync(localFilePath); // delete the file from local storage
        return response;
    }
    catch(error){
        console.log("Error uploading file on cloudinary");
        console.log(error);
        fs.unlinkSync(localFilePath);
        // delete the file from local storage. preferred to use unlinkSync instead of unlink as it is synchronous
        return null;
    }
};

export {uploadOnCloudinary};















// cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });