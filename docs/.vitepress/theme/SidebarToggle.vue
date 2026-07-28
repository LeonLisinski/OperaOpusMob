<script setup lang="ts">
import { onMounted, ref } from 'vue'

const STORAGE_KEY = 'opera-docs-sidebar-collapsed'
const collapsed = ref(false)

onMounted(() => {
  collapsed.value = localStorage.getItem(STORAGE_KEY) === 'true'
  document.documentElement.classList.toggle('sidebar-collapsed', collapsed.value)
})

function toggle() {
  collapsed.value = !collapsed.value
  localStorage.setItem(STORAGE_KEY, String(collapsed.value))
  document.documentElement.classList.toggle('sidebar-collapsed', collapsed.value)
}
</script>

<template>
  <button
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
