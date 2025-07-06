const { API_ENDPOINTS } = require('../config/api');
const { ultraFastFetch } = require('../utils/fetcher');
const { getBackgroundConfig } = require('../config/backgrounds');

class ProfileService {
    static getAvatarId(profileData) {
        if (profileData?.profileInfo?.avatarId) {
            return profileData.profileInfo.avatarId;
        }
        
        const skills = profileData?.profileInfo?.EquippedSkills;
        if (!skills?.length) return 406;

        for (const skill of skills) {
            if (String(skill).endsWith('06')) return skill;
        }
        return 406;
    }

    static async fetchProfileData(uid) {
        const profileUrl = `${API_ENDPOINTS[0]}?uid=${uid}`;
        const response = await ultraFastFetch(profileUrl);
        
        if (!response?.data) {
            throw new Error('Profile fetch failed');
        }

        return response.data;
    }

    static buildImageRequests(profileData, bgConfig) {
        const clothes = profileData.profileInfo?.equippedItems || [];
        const weapons = profileData.playerData?.weaponSkinShows || [];
        const petId = profileData.petInfo?.id;
        const avatarId = this.getAvatarId(profileData);

        const imageRequests = [];
        const overlayData = [];

        // Process clothes
        let cnt211 = 1;
        clothes.forEach(id => {
            if (!id) return;

            const idStr = String(id);
            const key = idStr.startsWith("211") ? `211_${cnt211++}` : idStr.substring(0, 3);
            const pos = bgConfig.positions[key];
            const size = bgConfig.sizes[key];

            if (pos && size) {
                imageRequests.push({
                    url: `https://freefireinfo.vercel.app/icon?id=${id}`,
                    width: size[0],
                    height: size[1]
                });
                overlayData.push(pos);
            }
        });

        // Add weapon
        if (weapons[0]) {
            imageRequests.push({
                url: `https://freefireinfo.vercel.app/icon?id=${weapons[0]}`,
                width: bgConfig.sizes.weapon[0],
                height: bgConfig.sizes.weapon[1]
            });
            overlayData.push(bgConfig.positions.weapon);
        }

        // Add pet
        if (petId) {
            imageRequests.push({
                url: `https://freefireinfo.vercel.app/icon?id=${petId}`,
                width: bgConfig.sizes.pet[0],
                height: bgConfig.sizes.pet[1]
            });
            overlayData.push(bgConfig.positions.pet);
        }

        // Add avatar
        imageRequests.push({
            url: `https://chars-three.vercel.app/char?id=${avatarId}`,
            width: bgConfig.sizes.avatar[0],
            height: bgConfig.sizes.avatar[1]
        });
        overlayData.push(bgConfig.positions.avatar);

        return {
            imageRequests,
            overlayData,
            metadata: {
                avatarId,
                clothes,
                weapons,
                petId
            }
        };
    }
}

module.exports = ProfileService;