import { defineStore } from 'pinia'
import localForage from "localforage"

localForage.config({
    driver: localForage.INDEXEDDB, // This force IndexedDB as the driver
})

export async function setIndexedDB(payload) {
    return localForage.setItem(payload.key, payload.value);
}

export async function getIndexedDB(key) {
    return await localForage.getItem(key);
}

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        directoryHandle: null,
        // audioFileHandles: [],
        // imageFileHandles: [],
        overlayProps: {
            canvasWidth: 1920,
            canvasHeight: 1080,
        },
        twitchConnectivity: {
            twitchHelixUrl: 'https://api.twitch.tv/helix',
            twitchIDUrl: 'https://id.twitch.tv',
            twitchWSLocalUrl: 'ws://localhost:8080/eventsub',
            twitchWSProdUrl: 'wss://eventsub.wss.twitch.tv/ws',
        },
        twitchTemporaries:{
            twitchBroadcasterID: '',
            twitchAppAccessToken: '',
            twitchUserAccessToken: '',
        },
        userEnteredSettings:{
            directoryName: null,
            audioFileNames: [],
            imageFileNames: [],
            twitchClientId: '',
            twitchClientSecret: '',
            twitchBroadcasterName: '',
            selectedTwitchEvents: ["channel.follow"],
            twitchEvents: [
                {
                id: 'twitchFollower', text: 'Follow', value: 'channel.follow', checked: true, version: '2',
                imageFileName: null, imageId: 'twitch-new-follower-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4', permission: 'moderator:read:followers',
                audioFileName: null, audioId: 'twitch-new-follower-audio', audioVolume: 0.5
                },
                {
                id: 'twitchSubscription', text: 'Subscription', value: 'channel.subscribe', checked: false, version: '1',
                imageFileName: null, imageId: 'twitch-new-subscriber-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4', permission: 'channel:read:subscriptions',
                audioFileName: null, audioId: 'twitch-new-subscriber-audio', audioVolume: 0.5
                },
                {
                id: 'twitchResubscription', text: 'Resubscription', value: 'channel.subscription.message', checked: false, version: '1',
                imageFileName: null, imageId: 'twitch-resubscriber-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4', permission: 'channel:read:subscriptions',
                audioFileName: null, audioId: 'twitch-resubscriber-audio', audioVolume: 0.5
                },
                {
                id: 'twitchGiftSubscription', text: 'Gifted Subscription', value: 'channel.subscription.gift', checked: false, version: '1',
                imageFileName: null, imageId: 'twitch-gifted-subscriber-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4', permission: 'channel:read:subscriptions',
                audioFileName: null, audioId: 'twitch-gifted-subscriber-audio', audioVolume: 0.5
                },
                {
                id: 'twitchRaid', text: 'Raid', value: 'channel.raid', checked: false, version: '1',
                imageFileName: null, imageId: 'twitch-raid-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4', permission: '',
                audioFileName: null, audioId: 'twitch-raid-audio', audioVolume: 0.5
                },
                {
                id: 'twitchCheer', text: 'Cheer', value: 'channel.cheer', checked: false, version: '1',
                imageFileName: null, imageId: 'twitch-cheer-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4', permission: 'bits:read',
                audioFileName: null, audioId: 'twitch-cheer-audio', audioVolume: 0.5
                },
                {
                id: 'twitchChannelPoints',text: 'Channel Points', value: 'channel.channel_points_custom_reward_redemption.add', checked: false, version: '1',
                imageFileName: null, imageId: 'twitch-channel-points-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4', permission: '',
                audioFileName: null, audioId: 'twitch-channel-points-audio', audioVolume: 0.5
                },
                {
                id: 'twitchFirstTimeChat', text: 'First Time Chat', value: 'NA', checked: false, version: '1',
                imageFileName: null, imageId: 'twitch-first-time-chat-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4', permission: '',
                audioFileName: null, audioId: 'twitch-first-time-chat-audio', audioVolume: 0.5
                },
                {
                id: 'twitchDonation', text: 'Donation', value: 'NA', checked: false, version: '1',
                imageFileName: null, imageId: 'twitch-donation-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4', permission: '',
                audioFileName: null, audioId: 'twitch-donation-audio', audioVolume: 0.5
                }
            ]
        }
    }),
    getters: {
        getSettings: (state) => state.userEnteredSettings,
        getCheckedTwitchEvents(state) {
            let result = state.userEnteredSettings.twitchEvents.filter(twitchEvent => twitchEvent.checked);
            return result;
        },
        getPermissionsString(state) {
            let result = state.userEnteredSettings.twitchEvents.filter(twitchEvent => twitchEvent.checked);
            let permissions = [...new Set(result.map(twitchEvent => twitchEvent.permission))].filter(n => n).join(' ');
            return permissions;
        },
        getCanvasWidth: (state) => {
            const dpr = window.devicePixelRatio || 1;
            return state.overlayProps.canvasWidth * dpr;
        },
        getCanvasHeight: (state) => {
            const dpr = window.devicePixelRatio || 1;
            return state.overlayProps.canvasHeight * dpr;
        }
    },
    persist: true
})