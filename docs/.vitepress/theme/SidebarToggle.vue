<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vitepress'
import {
  pathHasSidebar,
  readCollapsedPreference,
  syncSidebarCollapsedClass,
  writeCollapsedPreference,
} from './sidebarState'

const route = useRoute()
const collapsed = ref(false)

const hasSidebar = computed(() => pathHasSidebar(route.path))

function applyState() {
  syncSidebarCollapsedClass(collapsed.value, hasSidebar.value)
}

onMounted(() => {
  collapsed.value = readCollapsedPreference()
  applyState()
})

watch(hasSidebar, applyState)
watch(collapsed, applyState)

function toggle() {
  if (!hasSidebar.value) return
  collapsed.value = !collapsed.value
  writeCollapsedPreference(collapsed.value)
  applyState()
}
</script>

<template>
  <button
    v-if="hasSidebar"
    type="button"
    class="sidebar-collapse-toggle"
    :class="{ 'is-collapsed': collapsed }"
    :aria-expanded="!collapsed"
    aria-label="Prikaži ili sakrij lijevi izbornik"
    title="Sakrij / prikaži izbornik"
    @click="toggle"
  >
    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
      <path
        fill="currentColor"
        d="M14.71 6.71a1 1 0 0 0-1.42-1.42l-4 4a1 1 0 0 0 0 1.42l4 4a1 1 0 1 0 1.42-1.42L11.41 12l3.3-3.29z"
      />
    </svg>
  </button>
</template>
