import ReactGA from 'react-ga';

export function reportWebVitals({ id, name, label, value }) {
  ReactGA.event({
    category: 'Web Vitals',
    action: name,
    label: label || id,
    value: Math.round(name === 'CLS' ? value * 1000 : value),
    nonInteraction: true,
  });
}
