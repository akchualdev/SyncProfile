const express = require('express');
const router = express.Router();
const ProfileService = require('../services/profileService');
const ImageProcessor = require('../services/imageProcessor');
const BackgroundService = require('../services/backgroundService');
const { validateUID, validateBackground } = require('../utils/validator');
const { getBackgroundConfig, getAllBackgrounds } = require('../config/backgrounds');
const rateLimiter = require('../middleware/rateLimiter');

router.use(rateLimiter);

// Get available backgrounds
router.get('/backgrounds', (req, res) => {
    try {
        const backgrounds = getAllBackgrounds();
        res.json({
            success: true,
            data: backgrounds
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch backgrounds'
        });
    }
});

// Generate profile image
router.get('/profile', async (req, res) => {
    const startTime = process.hrtime.bigint();

    try {
        const { uid, bg = 1 } = req.query;

        // Validate inputs
        const uidValidation = validateUID(uid);
        if (!uidValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: uidValidation.error
            });
        }

        const bgValidation = validateBackground(bg);
        if (!bgValidation.isValid) {
            return res.status(400).json({
                success: false,
                error: bgValidation.error
            });
        }

        console.log(`⚡ Processing: ${uid} with background ${bgValidation.bgId}`);

        // Check if background is available
        if (!BackgroundService.isBackgroundAvailable(bgValidation.bgId)) {
            return res.status(400).json({
                success: false,
                error: 'Background not available'
            });
        }

        // Get background configuration
        const bgConfig = getBackgroundConfig(bgValidation.bgId);
        const backgroundBuffer = BackgroundService.getBackground(bgValidation.bgId);

        // Fetch profile data
        const profileData = await ProfileService.fetchProfileData(uid);

        // Build image requests
        const { imageRequests, overlayData, metadata } = ProfileService.buildImageRequests(profileData, bgConfig);

        console.log(`⚡ Loading ${imageRequests.length} images with ${bgConfig.name} background...`);
        console.log(`⚡ Avatar ID: ${metadata.avatarId}`);
        console.log(`⚡ Clothes: ${metadata.clothes.join(', ')}`);
        console.log(`⚡ Weapons: ${metadata.weapons.join(', ')}`);
        console.log(`⚡ Pet: ${metadata.petId}`);

        // Process all images
        const loadedImages = await ImageProcessor.processAllImages(imageRequests);

        // Build overlays
        const overlays = [];
        for (let i = 0; i < loadedImages.length; i++) {
            if (loadedImages[i] && overlayData[i]) {
                overlays.push({
                    input: loadedImages[i],
                    top: overlayData[i][1],
                    left: overlayData[i][0]
                });
            }
        }

        // Generate final image
        const finalImage = await ImageProcessor.generateFinalImage(backgroundBuffer, overlays);

        const endTime = process.hrtime.bigint();
        const processingTime = Number(endTime - startTime) / 1000000;

        console.log(`⚡ Generated in ${processingTime.toFixed(1)}ms | ${overlays.length} overlays | ${bgConfig.name}`);

        res.set({
            'Content-Type': 'image/png',
            'Cache-Control': 'public, max-age=3600',
            'Content-Length': finalImage.length,
            'X-Speed': `${processingTime.toFixed(1)}ms`,
            'X-Overlays': overlays.length,
            'X-Avatar': metadata.avatarId,
            'X-Background': bgConfig.name
        });

        res.send(finalImage);

    } catch (error) {
        const endTime = process.hrtime.bigint();
        const errorTime = Number(endTime - startTime) / 1000000;

        console.error(`❌ Error in ${errorTime.toFixed(1)}ms:`, error.message);

        res.status(500).json({
            success: false,
            error: 'Generation failed',
            time: `${errorTime.toFixed(1)}ms`,
            message: error.message
        });
    }
});

module.exports = router;