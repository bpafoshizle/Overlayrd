<template>
  <div>
    <p>Redirecting...</p>
  </div>
</template>

<script>
import { mapWritableState } from 'pinia'
import { useSettingsStore } from '../stores/settings'

export default {
  computed: {
    // gives access to this.settings inside the component and allows setting it
    ...mapWritableState(useSettingsStore, ['settings']),
  },
  created() {
    const token = new URLSearchParams(window.location.hash.replace("#", "")).get(
      "access_token"
    );
    if (token) {
      this.settings.twitchUserAccessToken = token
    } else if (this.$route.query.error) {
      console.error(this.$route.query.error)
    }

    // Redirect to the settings page
    this.$router.push("/settings");
  }
}
</script>