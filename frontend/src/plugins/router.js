import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import OverlayCanvas from '@/components/OverlayCanvas.vue'
import Settings from '@/components/Settings.vue'
import Positioning from '@/components/Positioning.vue'
import TwitchCallback from '@/components/TwitchCallback.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: "home",
      component: Home,
      meta: {
        showNav: true, // this route should show the navigation toolbar
      }
    },
    {
      path: '/overlay',
      name: "overlay",
      component: OverlayCanvas,
      meta: {
        showNavOnHover: true, // this route should hide the navigation toolbar until mouse hover
      }
    },
    {
      path: '/settings',
      name: "settings",
      component : Settings,
      meta: {
        showNav: true, // this route should show the navigation toolbar
      }
    },
    {
      path: '/auth/twitch/callback',
      name: "twitch-callback",
      component : TwitchCallback,
      meta: {
        showNav: false, // this route should show the navigation toolbar
      }
    },
    {
      path: '/positioning',
      name: "positioning",
      component : Positioning,
      meta: {
        showNav: true, // this route should show the navigation toolbar
      }
    }
  ]
})

export default router