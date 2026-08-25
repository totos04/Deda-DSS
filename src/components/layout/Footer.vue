<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <p>&copy; {{ year }} DedaDSS – Associazione Culturale</p>
  </footer>
</template>

<style scoped>
.app-footer {
  padding: 16px 32px;
  background-color: var(--footer-bg);
  border-top: 1px solid var(--footer-border);
  font-size: 0.8rem;
  color: var(--text-subtle);
  text-align: center;
}
</style>