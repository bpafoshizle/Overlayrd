<template>
  <v-app-bar :elevation="2">
    <div class="container">
      <ul class="navbar-nav me-auto mb-2 mb-md-0">
        <li class="nav-item">
          <router-link class="nav-link" to="/">Home</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/settings">Settings</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/overlay">Overlay</router-link>
        </li>
      </ul>
    </div>
  </v-app-bar>
</template>
