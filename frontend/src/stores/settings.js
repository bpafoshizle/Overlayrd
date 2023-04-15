import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', {
    state: () => ({
        imageFiles: [],
        audioFiles: [],
        settings:{
            canvasWidth: 1920,
            canvasHeight: 1080,
            twitchClientId: '',
            twitchClientSecret: '',
            twitchBroadcasterName: '',
            backendUrl: 'http://localhost:8000',
            twitchWSLocalUrl: 'ws://localhost:8080/eventsub',
            twitchWSProdUrl: 'wss://eventsub-beta.wss.twitch.tv/ws',
            selectedTwitchEvents: ["channel.follow"],
            twitchEvents: [
                {
                id: 'twitchFollower', text: 'Follow', value: 'channel.follow', checked: true,
                imageName: null, imageFileHandle: null, imageId: 'twitch-new-follower-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4',
                audioName: null, audioFileHandle: null, audioId: 'twitch-new-follower-audio', audioVolume: 0.5
                },
                {
                id: 'twitchSubscription', text: 'Subscription', value: 'channel.subscribe', checked: false,
                imageName: null, imageFileHandle: null, imageId: 'twitch-new-subscriber-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4',
                audioName: null, audioFileHandle: null, audioId: 'twitch-new-subscriber-audio', audioVolume: 0.5
                },
                {
                id: 'twitchResubscription', text: 'Resubscription', value: 'resubscription', checked: false,
                imageName: null, imageFileHandle: null, imageId: 'twitch-resubscriber-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4',
                audioName: null, audioFileHandle: null, audioId: 'twitch-resubscriber-audio', audioVolume: 0.5
                },
                {
                id: 'twitchGiftSubscription', text: 'Gifted Subscription', value: 'channel.subscription.gift', checked: false,
                imageName: null, imageFileHandle: null, imageId: 'twitch-gifted-subscriber-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4',
                audioName: null, audioFileHandle: null, audioId: 'twitch-gifted-subscriber-audio', audioVolume: 0.5
                },
                {
                id: 'twitchRaid', text: 'Raid', value: 'channel.raid', checked: false,
                imageName: null, imageFileHandle: null, imageId: 'twitch-raid-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4',
                audioName: null, audioFileHandle: null, audioId: 'twitch-raid-audio', audioVolume: 0.5
                },
                {
                id: 'twitchBits', text: 'Bits', value: 'channel.bits', checked: false,
                imageName: null, imageFileHandle: null, imageId: 'twitch-bits-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4',
                audioName: null, audioFileHandle: null, audioId: 'twitch-bits-audio', audioVolume: 0.5
                },
                {
                id: 'twitchChannelPoints',text: 'Channel Points', value: 'channel.channel_points_custom_reward_redemption.add', checked: false,
                imageName: null, imageFileHandle: null, imageId: 'twitch-channel-points-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4',
                audioName: null, audioFileHandle: null, audioId: 'twitch-channel-points-audio', audioVolume: 0.5
                },
                {
                id: 'twitchFirstTimeChat', text: 'First Time Chat', value: 'NA', checked: false,
                imageName: null, imageFileHandle: null, imageId: 'twitch-first-time-chat-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4',
                audioName: null, audioFileHandle: null, audioId: 'twitch-first-time-chat-audio', audioVolume: 0.5
                },
                {
                id: 'twitchDonation', text: 'Donation', value: 'NA', checked: false,
                imageName: null, imageFileHandle: null, imageId: 'twitch-donation-img', imageWidth: 700, imageHeight: 700,
                textXOffset: 0, textYOffset: 450, textColor: '#6441a4',
                audioName: null, audioFileHandle: null, audioId: 'twitch-donation-audio', audioVolume: 0.5
                },
            ],
        }
    }),
    getters: {
        getSettings: (state) => state.settings,
        getCheckedTwitchEvents(state) {
            return state.settings.twitchEvents.filter(twitchEvent => twitchEvent.checked);
          },
    }
})