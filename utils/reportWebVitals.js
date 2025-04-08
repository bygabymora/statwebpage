export function reportWebVitals({ id, name, label, value }) {
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', name, {
    event_category: 'Web Vitals',
    event_label: label || id,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    non_interaction: true,
  });
}
