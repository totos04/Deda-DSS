<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <header class="app-header">
    <div class="header-titles">
      <h1 class="page-title">Festival del lamento</h1>
      <span class="page-subtitle">Decision Support System</span>
    </div>

    <div class="header-actions">
      <!-- Date -->
      <div class="date-badge">
        📅 11 – 14 settembre 2025
      </div>

      <!-- Notifiche e Profilo Utente -->
      <button class="btn-icon">
        🔔<span class="badge">3</span>
      </button>
      <div class="user-avatar">👤</div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 70px;
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  position: sticky;
  top: 0;
  z-index: 90;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--text-heading);
}

.page-subtitle {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.date-badge {
  font-size: 0.85rem;
  color: var(--text-subheading);
  background-color: var(--bg-subtle);
  padding: 6px 12px;
  border-radius: 6px;
}

.btn-icon {
  position: relative;
  background: none;
  border: none;
  font-size: 1.1rem;
  cursor: pointer;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: var(--color-danger);
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  background-color: var(--border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
</style>