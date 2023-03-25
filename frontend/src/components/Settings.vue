<template>
  <v-responsive class="d-flex align-center text-center fill-height">
    <v-card
      class="mx-auto"
      max-width="900"
      outlined
    >
      <v-form v-model="valid" @submit.prevent="submit">
        <v-expansion-panels>
          <v-expansion-panel>
            <v-expansion-panel-title
                color="primary"
                class="display-1 text-uppercase font-weight-medium"
            >
              Settings File Location
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <file-location-input 
                v-model="settingsFileLocation"
                :button-text="'Select Settings File Location'"
              />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title
                color="primary"
                class="display-1 text-uppercase font-weight-medium"
            >
              Twitch Application Credentials
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-container>
                <v-row>
                  <v-col
                    cols="12"
                    md="6"
                  >
                    <v-text-field
                      v-model="twitchClientId"
                      :rules="twitchClientIdRules"
                      :counter="30"
                      label="Twitch Client ID"
                      required
                    ></v-text-field>
                  </v-col>

                  <v-col
                    cols="12"
                    md="6"
                  >
                    <v-text-field
                      v-model="twitchClientSecret"
                      :rules="twitchClientSecretRules"
                      :counter="30"
                      label="Twitch Client Secret"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <v-expansion-panel>
            <v-expansion-panel-title
              color="primary"
              class="display-1 text-uppercase font-weight-medium"
            >
              Twitch Subscripton Details
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-container>
                <v-row>
                  <v-text-field
                    v-model="twitchBroadcasterName"
                    :rules="twitchBroadcasterNameRules"
                    :counter="25" 
                    label="Twitch Broadcaster Name"
                    required
                    ></v-text-field>
                </v-row>
                <v-row>
                  <v-col v-for="twitchEvent in twitchEvents" 
                    :key="twitchEvent.value" cols="12" md="3">
                    <v-checkbox
                      v-model="twitchEvent.checked"
                      :label="twitchEvent.text"
                      :rules="twitchEventsRules"
                    ></v-checkbox>
                  </v-col>
                </v-row>
              </v-container>
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel>
            <v-expansion-panel-title
              color="primary"
              class="display-1 text-uppercase font-weight-medium"
            >
              Alert Media
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <directory-location-input v-model="mediaLocation"></directory-location-input>
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
import FileLocationInput from './FileLocationInput.vue'

export default {
  components: {
    DirectoryLocationInput,
    FileLocationInput,
  },
  data() {
    return {
      valid: false,
      mediaLocation: null,
      settingsFileLocation: null,
      twitchClientId: '',
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
      twitchBroadcasterName: '',
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
      twitchEvents: [
        { text: 'Follow', value: 'channel.follow', checked: true },
        { text: 'Host', value: 'channel.host', checked: false },
        { text: 'Subscription', value: 'channel.subscribe', checked: false },
        { text: 'Resubscription', value: 'resubscription', checked: false },
        { text: 'Gifted Subscription', value: 'channel.subscription.gift',  checked: false },
        { text: 'Bits', value: 'channel.bits', checked: false }, 
        { text: 'Cheer', value: 'channel.cheer', checked: false},
        { text: 'Raid', value: 'channel.raid', checked : false }
      ],
      twitchEventsRules: [
        value => {
          if (value || this.twitchEvents.some((value) => value.checked)) return true
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
    async submit (event) {
        const results = await event
        alert(JSON.stringify(results, null, 2))
        console.log(results)
    },
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
