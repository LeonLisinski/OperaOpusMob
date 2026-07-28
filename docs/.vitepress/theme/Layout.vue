<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { Teleport } from 'vue'
import SidebarToggle from './SidebarToggle.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout />
  <Teleport to="body">
    <SidebarToggle />
  </Teleport>
</template>
