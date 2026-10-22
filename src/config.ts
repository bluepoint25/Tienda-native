const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || "us-east-1_SOtYxhxql";
const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID || "788cde09j5e6579moocbnndub5";
const region = import.meta.env.VITE_COGNITO_REGION || "us-east-1";
const domain = import.meta.env.VITE_COGNITO_DOMAIN || "tienda-native-925830913213";

const authEndpoint = `https://${domain}.auth.${region}.amazoncognito.com`;
// Debe coincidir exactamente con una "Allowed callback URL" del app client
const redirectUri = import.meta.env.VITE_COGNITO_REDIRECT_URI || window.location.origin;

export const cognitoConfig = {
  userPoolId,
  clientId,
  region,
  domain,
  redirectUri,
  authorizationEndpoint: `${authEndpoint}/oauth2/authorize`,
  tokenEndpoint: `${authEndpoint}/oauth2/token`,
  logoutEndpoint: `${authEndpoint}/logout`,
  // Debe coincidir con una "Allowed sign-out URL" del app client
  logoutUri: window.location.origin,
};

export const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || "https://716y9y943d.execute-api.us-east-1.amazonaws.com/dev",
};
