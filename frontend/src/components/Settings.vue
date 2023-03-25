<template>
  <v-responsive class="d-flex align-center text-center fill-height">
    <v-card class="mx-auto" max-width="900" outlined>
      <v-form v-model="valid" @submit.prevent="submit">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title color="primary" class="display-1 text-uppercase font-weight-medium">
              Alert Media and Settings Directory
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <directory-location-input v-model="directoryHandle" button-text="Choose Directory"
                @directorySelected="directorySelected($event)" />
              <v-chip v-if="directoryHandle" class="ma-2" color="green" text-color="white">
                Selected Directory: {{ directoryHandle.name }}
              </v-chip>
              <v-chip v-if="settingsFileHandle" class="ma-2" color="green" text-color="white">
                Settings File: {{ settingsFileHandle.name }}
              </v-chip>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title color="primary" class="display-1 text-uppercase font-weight-medium">
              Twitch Application Credentials
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-container>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="settings.twitchClientId" :rules="twitchClientIdRules" :counter="30"
                      label="Twitch Client ID" required></v-text-field>
                  </v-col>

                  <v-col cols="12" md="6">
                    <v-text-field v-model="settings.twitchClientSecret" :rules="twitchClientSecretRules" :counter="30"
                      label="Twitch Client Secret" required></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title color="primary" class="display-1 text-uppercase font-weight-medium">
              Twitch Subscripton Details
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-container>
                <v-row>
                  <v-text-field v-model="settings.twitchBroadcasterName" :rules="twitchBroadcasterNameRules" :counter="25"
                    label="Twitch Broadcaster Name" required></v-text-field>
                </v-row>
                <v-row>
                  <v-col v-for="twitchEvent in settings.twitchEvents" :key="twitchEvent.value" cols="12" md="3">
                    <v-checkbox v-model="twitchEvent.checked" :label="twitchEvent.text"
                      :rules="twitchEventsRules"></v-checkbox>
                  </v-col>
                </v-row>
              </v-container>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <v-btn color="#FFFFFF" type="submit" block class="mt-2">Submit</v-btn>
      </v-form>
    </v-card>
  </v-responsive>
</template>

<script>
import { useTheme } from 'vuetify'
import DirectoryLocationInput from './DirectoryLocationInput.vue'

export default {
  components: {
    DirectoryLocationInput,
  },
  data() {
    return {
      valid: false,
      directoryHandle: null,
      settingsFileHandle: null,
      settings: {
        twitchClientId: '',
        twitchClientSecret: '',
        twitchBroadcasterName: '',
        twitchEvents: [
          { text: 'Follow', value: 'channel.follow', checked: true },
          { text: 'Host', value: 'channel.host', checked: false },
          { text: 'Subscription', value: 'channel.subscribe', checked: false },
          { text: 'Resubscription', value: 'resubscription', checked: false },
          { text: 'Gifted Subscription', value: 'channel.subscription.gift', checked: false },
          { text: 'Raid', value: 'channel.raid', checked: false },
          { text: 'Bits', value: 'channel.bits', checked: false },
          { text: 'Channel Points', value: 'channel.channel_points_custom_reward_redemption.add', checked: false },
        ],
      },
      twitchClientIdRules: [
        value => {
          if (value) return true

          return 'Twitch Client ID is requred.'
        },
        value => {
          if (value?.length == 30) return true

          return 'Twitch Client ID must be 30 characters.'
        },
      ],
      twitchClientSecret: '',
      twitchClientSecretRules: [
        value => {
          if (value) return true

          return 'Twitch Client Secret is requred.'
        },
        value => {
          if (value?.length == 30) return true

          return 'Twitch Client Secret must be 30 characters.'
        },
      ],
      twitchBroadcasterNameRules: [
        value => {
          if (value) return true

          return 'Twitch Broadcaster Name is requred.'
        },
        value => {
          //This regex checks for 4-25 characters, and only letters, numbers, and underscores
          if (/^[a-zA-Z0-9_]{4,25}$/.test(value)) return true
          return 'Twitch Broadcaster Name must be between 4 and 25 characters, and contain only letters, numbers, and underscores.'
        },
      ],
      twitchEventsRules: [
        value => {
          if (value || this.settings.twitchEvents.some((value) => value.checked)) return true
          return 'Please select at least one event.'
        }
      ]
    }
  },

  // computed: {
  //   atLeastOneTwitchEventChecked() {
  //     return [this.twitchEvents.some((value) => value.checked) || 'Please select at least one event']
  //   }
  // },

  methods: {
    async submit(event) {
      const results = await event
      alert(JSON.stringify(results, null, 2))
      this.writeFile(this.settingsFileHandle, JSON.stringify(this.settings, null, 2))
    },
    async directorySelected(handle) {
      this.directoryHandle = handle
      this.settingsFileHandle = await this.directoryHandle.getFileHandle('settings.json', { create: true });
      this.settings = JSON.parse(await (await this.settingsFileHandle.getFile()).text());
    },
    async writeFile(fileHandle, contents) {
      // Create a FileSystemWritableFileStream to write to.
      const writable = await fileHandle.createWritable();
      // Write the contents of the file to the stream.
      await writable.write(contents);
      // Close the file and write the contents to disk.
      await writable.close();
    }
    // atLeastOneChecked() {
    //   return this.twitchEvents.some((value) => value.checked) || 'Please select at least one event'
    // }
  },

  mounted() {
    const theme = useTheme();
    theme.global.name.value = 'mainTheme';
  }
}
</script>
