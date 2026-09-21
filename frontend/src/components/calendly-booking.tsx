'use client';

import Script from 'next/script';
import { useRef } from 'react';

type CalendlyWindow = Window & {
  Calendly?: { initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void };
};

export function CalendlyBooking() {
  const container = useRef<HTMLDivElement>(null);

  function initialize() {
    const parentElement = container.current;
    if (!parentElement || parentElement.querySelector('iframe')) return;
    (window as CalendlyWindow).Calendly?.initInlineWidget({
      url: 'https://calendly.com/manish-botta/30min?hide_event_type_details=1&primary_color=285c79',
      parentElement,
    });
  }

  return <section className="booking-section" aria-labelledby="booking-title">
    <div className="section-heading">
      <div><p className="section-label">Find a time</p><h2 id="booking-title">Book a 30-minute conversation.</h2></div>
      <a className="text-link" href="https://calendly.com/manish-botta/30min" target="_blank" rel="noopener noreferrer">Open Calendly ↗</a>
    </div>
    <p>Pick a date and time that works for you. Prefer email? The options above are always available.</p>
    <div ref={container} className="calendly-inline-widget" data-auto-load="false" style={{ width: '100%', height: 700 }} />
    <Script src="https://assets.calendly.com/assets/external/widget.js" strategy="afterInteractive" onReady={initialize}/>
  </section>;
}
