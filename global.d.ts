declare global {
  interface Window {
      Leaflet?: typeof import('leaflet');
  }
}

export {};