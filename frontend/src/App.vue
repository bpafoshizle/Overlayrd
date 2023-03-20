<template>
  <v-app>
    <v-navigation-drawer 
      v-if="!['overlay'].includes($route.name)"
      location="top"
      v-model="drawer"
      temporary
      color="primary"
    >
      <v-list>
        <v-list-item
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path">
          <v-list-item-action>
            <v-icon class="mx-2">{{ item.icon }}</v-icon>
                {{ item.title }}
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar v-if="!['overlay'].includes($route.name)"
      color="primary"
    >
      <v-app-bar-nav-icon 
      variant="text"
        @click.stop="drawer = !drawer"
      >
      </v-app-bar-nav-icon>
      <v-toolbar-title @click="$router.push('/')">
        <span style="cursor: pointer" class="display-1 text-uppercase font-weight-medium">
          {{ appTitle }}
        </span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn
          flat
          v-for="item in menuItems"
          :key="item.title"
          :to="item.path">
          <v-icon left dark class="mx-2">{{ item.icon }}</v-icon>
          {{ item.title }}
        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
// @ is an alias to /src
export default {
  name: "App",
  data(){
    return {
      appTitle: 'Socket Stream Overlay',
      drawer: false,
      group: null,
      menuItems: [
          { title: 'Home', path: '/', icon: 'home', icon: 'mdi-home'},
          { title: 'Settings', path: '/settings', icon: 'mdi-cog' },
          { title: 'Overlay', path: '/overlay', icon: 'mdi-rocket' },
          { title: 'Positioning', path: '/positioning', icon: 'mdi-view-dashboard' },
     ]
    }
  },
  watch: {
    group () {
      this.drawer = false
    },
  },
  computed: { 
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
    }
  },
};
</script>

<style>

</style>