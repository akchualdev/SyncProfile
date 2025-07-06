const sharp = require('sharp');
const { axiosInstance } = require('../config/api');
const { ULTRA_CONCURRENCY, IMAGE_QUALITY, COMPRESSION_LEVEL } = require('../config/constants');

class ImageProcessor {
    static async processImage(url, width, height) {
        try {
            const response = await axiosInstance.get(url, {
                responseType: 'arraybuffer',
                timeout: 4000
            });

            if (response.status !== 200) return null;

            return await sharp(Buffer.from(response.data))
                .resize(width, height, {
                    fit: 'contain',
                    background: { r: 0, g: 0, b: 0, alpha: 0 },
                    kernel: sharp.kernel.lanczos3,
                    withoutEnlargement: false
                })
                .png({
                    quality: IMAGE_QUALITY,
                    compressionLevel: COMPRESSION_LEVEL,
                    progressive: false,
                    force: true,
                    palette: false
                })
                .toBuffer();
        } catch (error) {
            console.log(`⚡ Fast skip: ${url.split('/').pop()}`);
            return null;
        }
    }

    static async processAllImages(requests) {
        const results = [];

        for (let i = 0; i < requests.length; i += ULTRA_CONCURRENCY) {
            const batch = requests.slice(i, i + ULTRA_CONCURRENCY);
            const batchResults = await Promise.allSettled(
                batch.map(req => this.processImage(req.url, req.width, req.height))
            );

            results.push(...batchResults.map(r => r.status === 'fulfilled' ? r.value : null));
        }

        return results;
    }

    static async generateFinalImage(backgroundBuffer, overlays) {
        return await sharp(backgroundBuffer)
            .composite(overlays)
            .png({
                quality: IMAGE_QUALITY,
                compressionLevel: COMPRESSION_LEVEL,
                progressive: false,
                force: true
            })
            .toBuffer();
    }
}

module.exports = ImageProcessor;