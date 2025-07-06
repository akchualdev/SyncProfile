const fs = require('fs');
const path = require('path');
const { BACKGROUND_CONFIGS } = require('../config/backgrounds');

class BackgroundService {
    constructor() {
        this.cachedBackgrounds = new Map();
    }

    initialize() {
        try {
            const backgroundsDir = path.join(__dirname, '../assets/backgrounds');
            
            Object.keys(BACKGROUND_CONFIGS).forEach(bgId => {
                const config = BACKGROUND_CONFIGS[bgId];
                const bgPath = path.join(backgroundsDir, config.filename);
                
                if (fs.existsSync(bgPath)) {
                    this.cachedBackgrounds.set(bgId, fs.readFileSync(bgPath));
                    console.log(`✅ Background ${bgId} (${config.name}) cached successfully`);
                } else {
                    console.error(`❌ Background ${bgId} not found:`, bgPath);
                }
            });
        } catch (error) {
            console.error('❌ Background service initialization failed:', error.message);
        }
    }

    getBackground(bgId) {
        const id = String(bgId);
        return this.cachedBackgrounds.get(id) || this.cachedBackgrounds.get('1');
    }

    isBackgroundAvailable(bgId) {
        return this.cachedBackgrounds.has(String(bgId));
    }
}

module.exports = new BackgroundService();