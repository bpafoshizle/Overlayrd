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
            mediaFileNames: [],
            twitchClientId: '',
            twitchClientSecret: '',
            twitchBroadcasterName: '',
            selectedTwitchEvents: ["channel.follow"],
            twitchEvents: [
                {
                id: 'twitchFollower', text: 'Follow', value: 'channel.follow', checked: true, version: '2',
                mediaFileName: null, mediaId: 'twitch-new-follower-img', mediaWidth: 700, mediaHeight: 700,
                mediaX: 50, mediaY: 50, textXOffset: 0, textYOffset: 0, textColor: '#6441a4', textSize: 56,
                permission: 'moderator:read:followers', audioFileName: null, audioId: 'twitch-new-follower-audio', 
                audioVolume: 0.5, type: "twitchEvent", mediaType: "img"
                },
                {
                id: 'twitchSubscription', text: 'Subscription', value: 'channel.subscribe', checked: false, version: '1',
                mediaFileName: null, mediaId: 'twitch-new-subscriber-img', mediaWidth: 700, mediaHeight: 700,
                mediaX: 50, mediaY: 50, textXOffset: 0, textYOffset: 0, textColor: '#6441a4', textSize: 56,
                permission: 'channel:read:subscriptions', audioFileName: null, audioId: 'twitch-new-subscriber-audio', 
                audioVolume: 0.5, type: "twitchEvent", mediaType: "img"
                },
                {
                id: 'twitchResubscription', text: 'Resubscription', value: 'channel.subscription.message', checked: false, version: '1',
                mediaFileName: null, mediaId: 'twitch-resubscriber-img', mediaWidth: 700, mediaHeight: 700,
                mediaX: 50, mediaY: 50, textXOffset: 0, textYOffset: 0, textColor: '#6441a4', textSize: 56,
                permission: 'channel:read:subscriptions', audioFileName: null, audioId: 'twitch-resubscriber-audio', 
                audioVolume: 0.5, type: "twitchEvent", mediaType: "img"
                },
                {
                id: 'twitchGiftSubscription', text: 'Gifted Subscription', value: 'channel.subscription.gift', checked: false, version: '1',
                mediaFileName: null, mediaId: 'twitch-gifted-subscriber-img', mediaWidth: 700, mediaHeight: 700,
                mediaX: 50, mediaY: 50, textXOffset: 0, textYOffset: 0, textColor: '#6441a4', textSize: 56,
                permission: 'channel:read:subscriptions', audioFileName: null, audioId: 'twitch-gifted-subscriber-audio', 
                audioVolume: 0.5, type: "twitchEvent", mediaType: "img"
                },
                {
                id: 'twitchRaid', text: 'Raid', value: 'channel.raid', checked: false, version: '1',
                mediaFileName: null, mediaId: 'twitch-raid-img', mediaWidth: 700, mediaHeight: 700,
                mediaX: 50, mediaY: 50, textXOffset: 0, textYOffset: 0, textColor: '#6441a4', textSize: 56,
                permission: '', audioFileName: null, audioId: 'twitch-raid-audio', audioVolume: 0.5,
                type: "twitchEvent", mediaType: "img"
                },
                {
                id: 'twitchCheer', text: 'Cheer', value: 'channel.cheer', checked: false, version: '1',
                mediaFileName: null, mediaId: 'twitch-cheer-img', mediaWidth: 700, mediaHeight: 700,
                mediaX: 50, mediaY: 50, textXOffset: 0, textYOffset: 0, textColor: '#6441a4', textSize: 56,
                permission: 'bits:read', audioFileName: null, audioId: 'twitch-cheer-audio', audioVolume: 0.5,
                type: "twitchEvent", mediaType: "img"
                },
                {
                id: 'twitchChannelPoints',text: 'Channel Points', value: 'channel.channel_points_custom_reward_redemption.add', checked: false, version: '1',
                mediaFileName: null, mediaId: 'twitch-channel-points-img', mediaWidth: 700, mediaHeight: 700,
                mediaX: 50, mediaY: 50, textXOffset: 0, textYOffset: 0, textColor: '#6441a4', textSize: 56, 
                permission: '', audioFileName: null, audioId: 'twitch-channel-points-audio', audioVolume: 0.5,
                type: "twitchEvent", mediaType: "img"
                },
                {
                id: 'twitchFirstTimeChat', text: 'First Time Chat', value: 'NA', checked: false, version: '1',
                mediaFileName: null, mediaId: 'twitch-first-time-chat-img', mediaWidth: 700, mediaHeight: 700,
                mediaX: 50, mediaY: 50, textXOffset: 0, textYOffset: 0, textColor: '#6441a4', textSize: 56, 
                permission: '', audioFileName: null, audioId: 'twitch-first-time-chat-audio', audioVolume: 0.5, 
                type: "twitchEvent", mediaType: "img"
                },
                {
                id: 'twitchDonation', text: 'Donation', value: 'NA', checked: false, version: '1',
                mediaFileName: null, mediaId: 'twitch-donation-img', mediaWidth: 700, mediaHeight: 700,
                mediaX: 50, mediaY: 50, textXOffset: 0, textYOffset: 0, textColor: '#6441a4', textSize: 56,
                permission: '', audioFileName: null, audioId: 'twitch-donation-audio', audioVolume: 0.5, 
                type: "twitchEvent", mediaType: "img"
                }
            ],
            selectedWidgets: ['counterWidget'],
            widgets: [
                {
                    id: 'counterWidget', text: 'Counter Widget', checked: false, mediaFileName: null, mediaId: 'counter-widget-img',
                    mediaWidth: 800, mediaHeight: 800, mediaX: 50, mediaY: 50, textXOffset: 0, textYOffset: 0, textColor: '#6441a4', 
                    textSize: 56, permission: '', audioFileName: null, audioId: 'counter-widget-audio', audioVolume: 0.5, type: "widget",
                    mediaType: "video"
                }
            ]
        },
    }),
    getters: {
        getSettings: (state) => state.userEnteredSettings,
        getCheckedTwitchEvents(state) {
            let result = state.userEnteredSettings.twitchEvents.filter(twitchEvent => twitchEvent.checked);
            return result;
        },
        getCheckedWidgets(state) {
            let result = state.userEnteredSettings.widgets.filter(widget => widget.checked);
            return result;
        },
        getAllCheckedEventsAndWidgets(state) {
            return [
                ...state.userEnteredSettings.twitchEvents.filter(twitchEvent => twitchEvent.checked), 
                ...state.userEnteredSettings.widgets.filter(widget => widget.checked)
            ]
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