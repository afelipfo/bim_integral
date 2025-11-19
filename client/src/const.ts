export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Plataforma BIM Medellín";

export const APP_LOGO = "https://placehold.co/128x128/0EA5E9/FFFFFF?text=BIM";

// Medellín geographic configuration
export const MEDELLIN_CENTER = {
  lat: 6.2476,
  lng: -75.5658,
  zoom: 12,
};

export const MEDELLIN_INFO = {
  city: "Medellín",
  department: "Antioquia",
  country: "Colombia",
  population: 2500000,
  area: 380.64, // km²
  elevation: 1495, // meters
  timezone: "America/Bogota",
  nickname: "Ciudad de la Eterna Primavera",
};

// Module colors for visual identity
export const MODULE_COLORS = {
  analytics: {
    primary: "oklch(0.65 0.15 250)",
    light: "oklch(0.85 0.10 250)",
    dark: "oklch(0.45 0.15 250)",
  },
  bim: {
    primary: "oklch(0.60 0.18 180)",
    light: "oklch(0.80 0.12 180)",
    dark: "oklch(0.40 0.18 180)",
  },
  geographic: {
    primary: "oklch(0.62 0.16 140)",
    light: "oklch(0.82 0.10 140)",
    dark: "oklch(0.42 0.16 140)",
  },
  ai: {
    primary: "oklch(0.58 0.20 290)",
    light: "oklch(0.78 0.14 290)",
    dark: "oklch(0.38 0.20 290)",
  },
  communications: {
    primary: "oklch(0.64 0.17 30)",
    light: "oklch(0.84 0.11 30)",
    dark: "oklch(0.44 0.17 30)",
  },
  empleabilidad: {
    primary: "oklch(0.61 0.19 60)",
    light: "oklch(0.81 0.13 60)",
    dark: "oklch(0.41 0.19 60)",
  },
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
