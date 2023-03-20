import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/components/Home.vue'
import OverlayCanvas from '@/components/OverlayCanvas.vue'
import Settings from '@/components/Settings.vue'
import Positioning from '@/components/Positioning.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: "home",
      component: Home,
    },
    {
      path: '/overlay',
      name: "overlay",
      component: OverlayCanvas
    },
    {
      path: '/settings',
      name: "settings",
      component : Settings
    },
    {
      path: '/positioning',
      name: "positioning",
      component : Positioning
    }
  ]
})