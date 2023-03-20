<template>
    <v-responsive class="d-flex align-center text-center fill-height">
        <h1 class="text-h2 font-weight-bold">Settings page coming soon</h1>
    </v-responsive>
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
