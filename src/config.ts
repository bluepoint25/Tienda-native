const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || "us-east-1_njjzAZOj1";
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || "6o8rtgglv3gb9liofe6p2u3c01";
const region = import.meta.env.VITE_COGNITO_REGION || "us-east-1";
const domain = import.meta.env.VITE_COGNITO_DOMAIN || "tienda-native-925830913213";

// Construir endpoints dinámicamente
const authEndpoint = `https://${domain}.auth.${region}.amazoncognito.com`;
const redirectUri = window.location.origin;

export const cognitoConfig = {
  userPoolId,
  clientId,
  region,
  domain,
  redirectUri,
  // OAuth2 endpoints
  authorizationEndpoint: `${authEndpoint}/oauth2/authorize`,
  tokenEndpoint: `${authEndpoint}/oauth2/token`,
};

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://8a0b1nfy7i.execute-api.us-east-1.amazonaws.com/dev",
};
