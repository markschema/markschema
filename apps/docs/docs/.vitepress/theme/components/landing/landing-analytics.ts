export type LandingCtaId =
  | 'hero-playground'
  | 'hero-getting-started'
  | 'problem-playground'
  | 'proof-playground'
  | 'how-playground'
  | 'comparison-playground'
  | 'faq-playground'
  | 'faq-getting-started'
  | 'final-playground'
  | 'final-getting-started'
  | 'final-api'

export type LandingCtaPlacement =
  | 'hero'
  | 'problem'
  | 'proof'
  | 'how-it-works'
  | 'comparison'
  | 'faq'
  | 'final-cta'

export interface LandingCtaEvent {
  ctaId: LandingCtaId
  placement: LandingCtaPlacement
  href: string
}

declare global {
  interface WindowEventMap {
    'mdshape:landing:cta': CustomEvent<LandingCtaEvent>
  }
}

export function trackLandingCtaClick(event: LandingCtaEvent): void {
  window.dispatchEvent(
    new CustomEvent('mdshape:landing:cta', { detail: event }),
  )

  if (typeof window !== 'undefined' && Array.isArray((window as any).dataLayer)) {
    ;(window as any).dataLayer.push({
      event: 'mdshape_landing_cta',
      ...event,
    })
  }
}
