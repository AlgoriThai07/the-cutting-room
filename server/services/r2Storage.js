const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const crypto = require('crypto');
const path = require('path');

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY
    }
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'the-cutting-room';
const PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL; // e.g., https://pub-xxx.r2.dev

/**
 * Upload file to R2
 * @param {Object} file - Mudter file object
 * @returns {Promise<string>} - Public URL of the uploaded file
 */
const uploadFile = async (file) => {
    try {
        const fileExtension = path.extname(file.originalname);
        const randomName = crypto.randomBytes(16).toString('hex');
        const fileName = `${randomName}${fileExtension}`;

        const uploadParams = {
            Bucket: BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            // ACL: 'public-read' // R2 buckets are usually private by default, controlled by bucket policy
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Construct public URL
        // If R2_PUBLIC_URL is set, use it. Otherwise, construct R2 dev URL (less reliable)
        if (PUBLIC_URL_BASE) {
            return `${PUBLIC_URL_BASE}/${fileName}`;
        } else {
            // Fallback (might not work without custom domain setup)
            return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${BUCKET_NAME}/${fileName}`;
        }

    } catch (error) {
        console.error('R2 Upload Error:', error);
        throw new Error('Failed to upload image to R2');
    }
};

module.exports = {
    uploadFile
};
