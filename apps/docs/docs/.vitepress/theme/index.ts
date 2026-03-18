import DefaultTheme from 'vitepress/theme'

import DocsLanding from './components/DocsLanding.vue'
import DottedGlowBackground from './components/landing/DottedGlowBackground.vue'
import BackgroundRippleEffect from './components/landing/BackgroundRippleEffect.vue'
import GlowingEffectBorder from './components/landing/GlowingEffectBorder.vue'
import ComparePane from './components/landing/ComparePane.vue'
import CodeBlockTabs from './components/landing/CodeBlockTabs.vue'
import CardsFreeApplicabilityGrid from './components/landing/CardsFreeApplicabilityGrid.vue'

import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DocsLanding', DocsLanding)
    app.component('DottedGlowBackground', DottedGlowBackground)
    app.component('BackgroundRippleEffect', BackgroundRippleEffect)
    app.component('GlowingEffectBorder', GlowingEffectBorder)
    app.component('ComparePane', ComparePane)
    app.component('CodeBlockTabs', CodeBlockTabs)
    app.component('CardsFreeApplicabilityGrid', CardsFreeApplicabilityGrid)
  },
}
