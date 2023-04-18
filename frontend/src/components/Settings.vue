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
              <v-chip v-if="directoryHandle" class="ma-2" color="primary" text-color="white">
                Selected Directory: {{ directoryHandle.name }}
              </v-chip>
              <v-chip v-if="settingsFileHandle" class="ma-2" color="primary" text-color="white">
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
                <v-row v-for="(twitchEvent, i) in settings.twitchEvents" :key="twitchEvent.value">
                  <v-col cols="12" md="6">
                    <v-switch v-model="settings.selectedTwitchEvents" :label="twitchEvent.text" color="primary"
                      :value="twitchEvent.value" :rules="twitchEventsRules" />
                  </v-col>
                  <v-divider inset vertical></v-divider>
                  <v-col cols="12" md="6" v-if="twitchEvent.checked">
                    <v-select variant="underlined" label="Image" :items="imageFiles" item-title="name"
                      v-model="settings.twitchEvents[i].imageName" color="primary" />
                    <v-select variant="underlined" label="Audio" :items="audioFiles" item-title="name"
                      v-model="settings.twitchEvents[i].audioName" color="primary" />
                  </v-col>
                </v-row>
              </v-container>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-btn color="primary" type="submit" block class="mt-2">Save and Authorize</v-btn>
      </v-form>
    </v-card>
  </v-responsive>
</template>

<script>
import { useTheme } from 'vuetify'
import DirectoryLocationInput from './DirectoryLocationInput.vue'
import { mapWritableState } from 'pinia'
import { useSettingsStore } from '../stores/settings'

export default {
  components: {
    DirectoryLocationInput,
  },
  data() {
    return {
      valid: false,
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
          //if (value || this.settings.twitchEvents.some((value) => value.checked)) return true
          if (this.settings.selectedTwitchEvents.length > 0) return true
          return 'Please select at least one event.'
        }
      ]
    }
  },

  watch: {
    'settings.selectedTwitchEvents': function (val, oldVal) {
      this.settings.twitchEvents.forEach((twitchEvent) => {
        if (val.includes(twitchEvent.value)) {
          twitchEvent.checked = true
        } else {
          twitchEvent.checked = false
        }
      })
    },
  },

  computed: {
    // gives access to this.settings inside the component and allows setting it
    ...mapWritableState(useSettingsStore, ['settings']),
    ...mapWritableState(useSettingsStore, ['imageFiles']),
    ...mapWritableState(useSettingsStore, ['audioFiles']),
    ...mapWritableState(useSettingsStore, ['settingsFileHandle']),
    ...mapWritableState(useSettingsStore, ['directoryHandle']),
  },

  methods: {
    async submit(event) {
      const results = await event
      this.writeFile(this.settingsFileHandle, JSON.stringify(this.settings, null, 2));
      window.location.href = `${this.settings.twitchIDUrl}/oauth2/authorize?` +
        'response_type=token' +
        `&client_id=${encodeURIComponent(this.settings.twitchClientId)}` +
        `&redirect_uri=${encodeURIComponent('http://localhost:3000/auth/twitch/callback')}` +
        `& scope=${encodeURIComponent('moderator:read:followers channel:read:subscriptions')} ` +
        `& state=${encodeURIComponent(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))}`;
    },

    async directorySelected(handle) {
      this.directoryHandle = handle

      // Set up the audio and image file lists
      for await (const entry of this.directoryHandle.values()) {
        if (entry.kind === 'file') {
          if (entry.name === 'settings.json') {
            // Set up the settings file
            this.settingsFileHandle = await this.directoryHandle.getFileHandle('settings.json');

            const permitted = await this.verifyPermission(this.settingsFileHandle)
            if (permitted) {
              const fileSettings = JSON.parse(await (await this.settingsFileHandle.getFile()).text());
              this.settings = { ...this.settings, ...fileSettings };
            }
            continue;
          }
          else {
            const extension = entry.name.slice(-4); // get last 4 characters of the filename
            if (extension === ".png" || extension === ".jpg" || extension === ".gif") {
              this.pushIfNotExists(this.imageFiles, entry, 'name')
            } else if (extension === ".mp3" || extension === ".wav" || extension === ".ogg") {
              this.pushIfNotExists(this.audioFiles, entry, 'name')
            }
          }
        }
      }

      if (!this.settingsFileHandle) {
        this.settingsFileHandle = await this.directoryHandle.getFileHandle('settings.json', { create: true });
      }
      else {
        this.settings.twitchEvents.forEach((twitchEvent) => {
          twitchEvent.imageFileHandle = this.imageFiles.find((imageFile) => imageFile.name === twitchEvent.imageName);
          twitchEvent.audioFileHandle = this.audioFiles.find((audioFile) => audioFile.name === twitchEvent.audioName);
        })
      }
    },

    pushIfNotExists(array, object, property) {
      if (!array.some((e) => e[property] === object[property])) {
        array.push(object)
      }
    },

    async writeFile(fileHandle, contents) {
      // Create a FileSystemWritableFileStream to write to.
      const writable = await fileHandle.createWritable();
      // Write the contents of the file to the stream.
      await writable.write(contents);
      // Close the file and write the contents to disk.
      await writable.close();
    },
    getImageNames() {
      return this.imageFiles.map((imageFile) => imageFile.name);
    },
    getAudioNames() {
      return this.audioFiles.map((audioFile) => audioFile.name);
    },
    async verifyPermission(fileHandle, readWrite) {
      const options = {};
      if (readWrite) {
        options.mode = 'readwrite';
      }
      // Check if permission was already granted. If so, return true.
      if ((await fileHandle.queryPermission(options)) === 'granted') {
        return true;
      }
      // Request permission. If the user grants permission, return true.
      if ((await fileHandle.requestPermission(options)) === 'granted') {
        return true;
      }
      // The user didn't grant permission, so return false.
      return false;
    }
  },

  mounted() {
    const theme = useTheme();
    theme.global.name.value = 'mainTheme';
  }
}
</script>
