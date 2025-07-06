module.exports = {
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    
    // API Configuration
    API_TIMEOUT: 4000,
    MAX_RETRIES: 2,
    ULTRA_CONCURRENCY: 10,
    
    // Image Processing
    IMAGE_QUALITY: 85,
    COMPRESSION_LEVEL: 2,
    MAX_CONTENT_LENGTH: 3 * 1024 * 1024,
    
    // Rate Limiting
    RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
    RATE_LIMIT_MAX: 100 // requests per window
};