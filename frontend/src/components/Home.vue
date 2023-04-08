<template>
  <v-container class="fill-height">
    <v-responsive class="d-flex align-center text-center fill-height">
      <v-img contain height="300" src="@/assets/logo.svg" />

      <h1 class="text-h2 font-weight-bold">Overlayrd</h1>

      <div class="py-14" />

      <v-row class="d-flex align-center justify-center">
        <v-col cols="auto">
          <v-btn href="/settings" min-width="164" rel="noopener noreferrer" variant="text">
            <v-icon icon="mdi-cog" size="large" start />

            Settings
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn color="primary" href="/overlay" min-width="228" rel="noopener noreferrer" size="x-large" target="_blank"
            variant="flat">
            <v-icon icon="mdi-rocket" size="large" start />

            Launch Overlay
          </v-btn>
        </v-col>

        <v-col cols="auto">
          <v-btn href="/positioning" min-width="164" rel="noopener noreferrer" target="_blank" variant="text">
            <v-icon icon="mdi-view-dashboard" size="large" start />

            Positioning
          </v-btn>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script>
import { useTheme } from 'vuetify'

export default {

  mounted() {
    const theme = useTheme();
    theme.global.name.value = 'mainTheme';
  }
}
</script>
