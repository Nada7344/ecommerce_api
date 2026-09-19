import { v2 as cloudinary } from 'cloudinary';
import { APPLICATION_NAME, CLOUD_API_KEY, CLOUD_API_SECRET, CLOUD_NAME } from '../../../../config/config.service.js';
import { type } from 'node:os';

export const cloud = () => {
      cloudinary.config({ 
        cloud_name: CLOUD_NAME, 
        api_key: CLOUD_API_KEY, 
        api_secret:CLOUD_API_SECRET,
        secure:true
    });
    

    return cloudinary;
}

export const uploadFile = async({file={},path="general"}={}) => {
    return await cloud().uploader.upload(file.path, {
        folder:`${APPLICATION_NAME}/${path}`
    })
}
export const uploadFiles = async ({ files = [], path = "general" } = {}) => {
    const attachments =[]
    for (const file of files) {
        const { secure_url, public_id } = await uploadFile({ file, path });
        attachments.push({ secure_url, public_id })
        
    }
    return attachments;
}

export const deleteResources = async({
    public_ids=[],
    options={
        type: "upload",
        resource_type:"image"
    }
} = {}) => {
    return await cloud().api.delete_resources(public_ids ,options)
}


