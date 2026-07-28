<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import SidebarToggle from './SidebarToggle.vue'

const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #layout-top>
      <SidebarToggle />
    </template>
  </Layout>
</template>
