<template>
  <section class="rk-section rk-findus" aria-labelledby="rk-findus-heading">
    <header class="rk-section-head">
      <h2 id="rk-findus-heading">Find Us On</h2>
    </header>

    <div class="rk-findus__grid">
      <a
        href="https://www.producthunt.com/products/markschema?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-markschema"
        target="_blank"
        rel="noopener noreferrer"
        class="rk-findus__card"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="12" fill="#DA552F"/>
          <path d="M13.5 7H9v10h2.5v-3h2c2.21 0 4-1.79 4-3.5S15.71 7 13.5 7zm0 4.5h-2V9.5h2c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z" fill="#fff"/>
        </svg>
        <span class="rk-findus__label">Product Hunt</span>
      </a>

      <a
        href="https://github.com/markschema/markschema"
        target="_blank"
        rel="noopener noreferrer"
        class="rk-findus__card"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        <span class="rk-findus__label">GitHub</span>
      </a>

      <a
        href="https://www.npmjs.com/package/@markschema/mdshape"
        target="_blank"
        rel="noopener noreferrer"
        class="rk-findus__card"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="#CB3837" aria-hidden="true">
          <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.331h-2.669zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z"/>
        </svg>
        <span class="rk-findus__label">npm</span>
      </a>
    </div>
  </section>
</template>

<style scoped>
.rk-findus__grid {
  display: flex;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
}

.rk-findus__card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  border: 1px solid var(--rk-border);
  border-radius: 8px;
  background: var(--rk-surface);
  color: var(--rk-text);
  text-decoration: none;
  transition: border-color 0.2s, background 0.2s;
}

.rk-findus__card:hover {
  border-color: var(--rk-accent, #6c63ff);
  background: var(--rk-surface-hover, var(--rk-surface));
}

.rk-findus__label {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}
</style>
