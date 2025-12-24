import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = async (locafilepath)=>{
    try{
        if(!locafilepath)
            return null
        const transfer = await cloudinary.uploader.upload(locafilepath,{
            resource_type:"auto"
        })
        console.log("file is uploaded on cloudinary",transfer.url);
        return transfer.url
    }
    catch(error){
        fs.unlinkSync(locafilepath)
        return null;
    }
}
cloudinary.v2.uploader.upload("https://upload.wikimedia. org/wikipedia/commons/a/ae/Olympic_flag.jpg",
{ public_id: "olympic_flag" },
function (error, result) { console.log(result); });

export {upload}