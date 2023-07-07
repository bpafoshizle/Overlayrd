<template>
  <v-app>
    <v-navigation-drawer v-if="showNav" location="top" v-model="drawer" temporary color="primary">
      <v-list>
        <v-list-item v-for="item in menuItems" :key="item.title" :to="item.path">
          <v-list-item-action>
            <v-icon class="mx-2">{{ item.icon }}</v-icon>
            {{ item.title }}
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar v-if="showNav" color="primary">
      <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer">
      </v-app-bar-nav-icon>
      <v-toolbar-title @click="$router.push('/')">
        <span style="cursor: pointer" class="display-1 font-weight-medium">
          {{ appTitle }}
        </span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-toolbar-items class="hidden-xs-only">
        <v-btn flat v-for="item in menuItems" :key="item.title" :to="item.path">
          <v-icon left dark class="mx-2">{{ item.icon }}</v-icon>
          {{ item.title }}


          <v-menu v-if="showEventDropdown(item.path)" activator="parent">
            <template v-slot:activator="{ attr }">
              <v-btn v-bind="attr">
                Events
                <v-icon right>mdi-chevron-down</v-icon>
              </v-btn>
            </template>
            <v-list>
              <v-list-item v-for="(event) in getCheckedTwitchEvents" :key="event.imageId" :value="event.imageId"
                @click="positionEventSelected(event.id, $event)">
                <v-list-item-title>{{ event.text }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

        </v-btn>
      </v-toolbar-items>
    </v-toolbar>
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import { mapState, mapWritableState } from 'pinia'
import { useSettingsStore } from './stores/settings'
import { useDatabus } from './stores/databus'

// @ is an alias to /src
export default {
  name: "App",
  data() {
    return {
      appTitle: 'Overlayrd',
      drawer: false,
      group: null,
      menuItems: [
        { title: 'Home', path: '/', icon: 'home', icon: 'mdi-home' },
        { title: 'Settings', path: '/settings', icon: 'mdi-cog' },
        { title: 'Overlay', path: '/overlay', icon: 'mdi-rocket' },
        { title: 'Positioning', path: '/positioning', icon: 'mdi-view-dashboard' },
      ],
      isHovering: false,
      navBarHeight: 0,
    }
  },

  watch: {
    group() {
      this.drawer = false
    },
  },

  computed: {
    ...mapWritableState(useSettingsStore, ['userEnteredSettings']),
    ...mapState(useSettingsStore, {
      getCheckedTwitchEvents(store) {
        return store.getCheckedTwitchEvents;
      }
    }),
    ...mapWritableState(useDatabus, ['positioningSelectedEvent']),
    isAuthenticated() {
      return this.$store.getters.isAuthenticated
    },
    showNav() {
      const { meta } = this.$route;
      if (meta.showNavOnHover) {
        // hide navigation toolbar until mouse hover on special page
        return this.isHovering;
      } else {
        // show navigation toolbar on all other pages
        return meta.showNav !== false;
      }
    },
    showEventDropdown() {
      return (itemPath) => {
        return this.$route.path === '/positioning' && itemPath === '/positioning';
      }
    },
  },

  methods: {
    handleMouseMove(event) {
      // only update isHovering if the mouse is over the navigation toolbar area
      if (event.clientY <= this.navBarHeight) {
        this.isHovering = true;
      } else {
        this.isHovering = false;
      }
    },

    positionEventSelected(eventId, event) {
      console.log(`event selected for positioning: ${eventId}`);
      this.positioningSelectedEvent = eventId;
    },
  },

  mounted() {
    // get the height of the navigation toolbar
    const navBar = document.querySelector('.v-toolbar');
    if (navBar) {
      this.navBarHeight = navBar.offsetHeight;
    }
    // listen for mouse enter/leave events on the navigation toolbar area
    document.addEventListener('mousemove', this.handleMouseMove);
  },

  beforeDestroy() {
    // clean up event listener
    document.removeEventListener('mousemove', this.handleMouseMove);
  }
};
</script>

<style></style>