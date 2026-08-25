<script setup lang="ts">
import Header from '@/components/layout/Header.vue'
import Sidebar from '@/components/layout/Sidebar.vue'
import Footer from '@/components/layout/Footer.vue'
</script>

<template>
  <div class="app-layout">
    <Sidebar />

    <div class="main-wrapper">
      <Header />

      <main class="page-content">
        <RouterView />
      </main>

      <Footer />
    </div>
  </div>
</template>

<style>
/* ==========================================================================
   PALETTE COLORI GLOBALE
   ========================================================================== */
:root {
  /* Brand & Primario */
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-primary-light: rgba(37, 99, 235, 0.25);
  --color-primary-text: #60a5fa;

  /* Azioni, Stati & Feedback */
  --color-success: #16a34a;
  --color-success-hover: #15803d;
  --color-success-bg: #dcfce7;
  --color-success-border: #86efac;
  --color-danger: #ef4444;
  --color-danger-hover: #dc2626;

  /* Sidebar & Temi Scuri */
  --sidebar-bg: #121927;
  --sidebar-text: #ffffff;
  --sidebar-text-muted: #94a3b8;
  --sidebar-border: rgba(255, 255, 255, 0.15);
  --sidebar-card-bg: #1e293b;

  /* Header & Footer */
  --header-bg: #ffffff;
  --header-border: #e2e8f0;
  --footer-bg: #ffffff;
  --footer-border: #e2e8f0;

  /* Neutrali & Sfondi Pagina */
  --bg-page: #f8fafc;
  --bg-surface: #ffffff;
  --bg-subtle: #f8fafc;
  --bg-hover: #e2e8f0;

  /* Bordi & Separatori */
  --border-color: #cbd5e1;
  --border-light: #e2e8f0;

  /* Testi */
  --text-heading: #0f172a;
  --text-subheading: #1e293b;
  --text-body: #1e293b;
  --text-muted: #64748b;
  --text-subtle: #94a3b8;
}

/* Reset base */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  background-color: var(--bg-page);
  color: var(--text-body);
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.main-wrapper {
  flex: 1;
  margin-left: 260px; /* Larghezza esatta della Sidebar */
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-content {
  flex: 1; /* Spinge il Footer in fondo alla pagina */
  padding: 24px 32px;
}
</style>