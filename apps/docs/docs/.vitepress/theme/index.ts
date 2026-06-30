import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'

import DocsLanding from './components/DocsLanding.vue'

import './custom.css'

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY
const POSTHOG_HOST =
  import.meta.env.VITE_POSTHOG_HOST ?? 'https://us.i.posthog.com'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router }) {
    app.component('DocsLanding', DocsLanding)

    if (import.meta.env.SSR || !POSTHOG_KEY) return

    void import('posthog-js').then(({ default: posthog }) => {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        defaults: '2026-06-25',
        capture_pageview: false,
        capture_pageleave: true,
      })

      // VitePress navega como SPA: a carga inicial não dispara onAfterRouteChange,
      // então capturamos a primeira página aqui e cada navegação seguinte no hook.
      posthog.capture('$pageview')

      const prev = router.onAfterRouteChange
      router.onAfterRouteChange = (to) => {
        prev?.(to)
        posthog.capture('$pageview')
      }
    })
  },
} satisfies Theme
