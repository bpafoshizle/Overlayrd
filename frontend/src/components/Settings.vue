<template>
  <v-responsive class="d-flex align-center text-center fill-height">
    <v-card class="mx-auto" max-width="900" outlined>
      <v-form v-model="valid" @submit.prevent="submit">
        <v-expansion-panels>
          <v-expansion-panel v-on:click="loadFileHandles()">
            <v-expansion-panel-title color="primary" class="display-1 text-uppercase font-weight-medium">
              Alert Media Directory
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <directory-location-input v-model="directoryHandle" button-text="Choose Directory"
                @directorySelected="directorySelected($event)" />
              <v-chip v-if="directoryHandle" class="ma-2" color="primary" text-color="white">
                Selected Directory: {{ directoryHandle.name }}
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
                    <v-text-field v-model="userEnteredSettings.twitchClientId" :rules="twitchClientIdRules" :counter="30"
                      :type="'password'" label="Twitch Client ID" required></v-text-field>
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field v-model="userEnteredSettings.twitchClientSecret" :rules="twitchClientSecretRules"
                      :counter="30" :type="'password'" label="Twitch Client Secret" required></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel v-on:click="loadFileHandles()">
            <v-expansion-panel-title color="primary" class="display-1 text-uppercase font-weight-medium">
              Twitch Subscripton Details
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-container>
                <v-row>
                  <v-text-field v-model="userEnteredSettings.twitchBroadcasterName" :rules="twitchBroadcasterNameRules"
                    :counter="25" label="Twitch Broadcaster Name" required></v-text-field>
                </v-row>
                <v-row v-for="(twitchEvent, i) in userEnteredSettings.twitchEvents" :key="twitchEvent.value">
                  <v-col cols="12" md="6">
                    <v-switch v-model="userEnteredSettings.selectedTwitchEvents" :label="twitchEvent.text" color="primary"
                      :value="twitchEvent.value" :rules="twitchEventsRules" />
                  </v-col>
                  <v-divider inset vertical></v-divider>
                  <v-col cols="12" md="6" v-if="twitchEvent.checked">
                    <v-select variant="underlined" label="Image" :items="userEnteredSettings.imageFileNames"
                      item-title="name" v-model="userEnteredSettings.twitchEvents[i].imageName" color="primary" />
                    <v-select variant="underlined" label="Audio" :items="userEnteredSettings.audioFileNames"
                      item-title="name" v-model="userEnteredSettings.twitchEvents[i].audioName" color="primary" />
                  </v-col>
                </v-row>
              </v-container>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <v-btn color="primary" type="submit" block class="mt-2">Validate Settings</v-btn>
        <v-btn color="primary" @click="authorizeTwitch" block class="mt-2">Authorize Twitch</v-btn>
      </v-form>
    </v-card>
  </v-responsive>
</template>

<script>
import { useTheme } from 'vuetify'
import DirectoryLocationInput from './DirectoryLocationInput.vue'
import { mapWritableState, mapState } from 'pinia'
import { useSettingsStore, setIndexedDB, getIndexedDB } from '../stores/settings'

export default {
  components: {
    DirectoryLocationInput,
  },
  data() {
    return {
      directoryHandle: null,
      audioFileHandles: [],
      imageFileHandles: [],
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
          if (this.userEnteredSettings.selectedTwitchEvents.length > 0) return true
          return 'Please select at least one event.'
        }
      ]
    }
  },

  watch: {
    'userEnteredSettings.selectedTwitchEvents': function (val, oldVal) {
      this.userEnteredSettings.twitchEvents.forEach((twitchEvent) => {
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
    ...mapWritableState(useSettingsStore, ['userEnteredSettings']),
    ...mapWritableState(useSettingsStore, ['twitchConnectivity']),
    ...mapWritableState(useSettingsStore, ['settingsFileHandle']),
    ...mapState(useSettingsStore, {
      getPermissionsString(store) {
        return store.getPermissionsString;
      }
    })
  },

  methods: {
    async submit(event) {
      //TODO: Validate the settings
      const results = await event
    },

    async authorizeTwitch(event) {
      const results = await event
      window.location.href = `${this.twitchConnectivity.twitchIDUrl}/oauth2/authorize?` +
        'response_type=token' +
        `&client_id=${encodeURIComponent(this.userEnteredSettings.twitchClientId)}` +
        `&redirect_uri=${encodeURIComponent('http://localhost:3000/auth/twitch/callback')}` +
        `&scope=${encodeURIComponent(this.getPermissionsString)}` +
        `&state=${encodeURIComponent(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15))}`;
    },

    async directorySelected(handle) {
      setIndexedDB(
        { key: 'directoryHandle', value: handle }
      )
      this.directoryHandle = handle;
      this.userEnteredSettings.directoryName = handle.name;

      // Set up the audio and image file lists
      for await (const entry of this.directoryHandle.values()) {
        if (entry.kind === 'file') {
          const extension = entry.name.slice(-4); // get last 4 characters of the filename
          if (extension === ".png" || extension === ".jpg" || extension === ".gif") {
            if (!this.userEnteredSettings.imageFileNames.includes(entry.name)) {
              this.userEnteredSettings.imageFileNames.push(entry.name)
              this.pushIfNotExists(this.imageFileHandles, entry, 'name')
            }
            setIndexedDB(
              { key: entry.name, value: entry }
            )
          } else if (extension === ".mp3" || extension === ".wav" || extension === ".ogg") {
            if (!this.userEnteredSettings.audioFileNames.includes(entry.name)) {
              this.userEnteredSettings.audioFileNames.push(entry.name)
              this.pushIfNotExists(this.audioFileHandles, entry, 'name')
            }
            let fileHandle = await setIndexedDB(
              { key: entry.name, value: entry }
            )

          }
        }
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
    },
    async loadFileHandles() {
      if (this.directoryHandle) {
        const permitted = await this.verifyPermission(this.directoryHandle)
        if (permitted) {
          try {
            this.userEnteredSettings.audioFileNames.forEach(async (audioFileName, idx) => {
              this.audioFileHandles[idx] = await getIndexedDB(audioFileName);
            })
            this.userEnteredSettings.imageFileNames.forEach(async (imageFileName, idx) => {
              this.imageFileHandles[idx] = await getIndexedDB(imageFileName);
            })
            this.assignFileHandlesToEventDataStructures();
          } catch (e) {
            console.log(e)
          }
        }
      }
    },
    async assignFileHandlesToEventDataStructures() {
      this.userEnteredSettings.twitchEvents.forEach(async (twitchEvent) => {
        twitchEvent.imageFileHandle = await getIndexedDB(twitchEvent.imageName);
        twitchEvent.audioFileHandle = await getIndexedDB(twitchEvent.audioName);
      })
    }
  },

  async mounted() {
    const theme = useTheme();
    theme.global.name.value = 'mainTheme';
    this.directoryHandle = await getIndexedDB('directoryHandle') || null
  }
}
</script>
