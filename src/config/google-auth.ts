/**
 * Google Auth configuration.
 *
 * Replace the placeholder below with your actual Web Client ID
 * from Google Cloud Console after completing the setup.
 */

/**
 * Web Client ID from Google Cloud Console.
 * This is used by both the Google Sign-In SDK on the client
 * AND the backend to verify the idToken (must match
 * app.social.google.client-id in BE_NihongoApp/application.yml,
 * otherwise the backend rejects the idToken with "Invalid or
 * unverified Google ID token").
 */
export const GOOGLE_WEB_CLIENT_ID =
  "80954200956-4icfk20o6he928rr9oqipunclmnkbifr.apps.googleusercontent.com";

/**
 * Android Client ID from Google Cloud Console (OAuth 2.0 Client ID of
 * type "Android"), registered against this app's package name and
 * signing cert SHA-1. Not passed to GoogleSignin.configure() — the SDK
 * (v16+) resolves it automatically via that registration — kept here
 * only as a record of the value Play Services must find registered.
 */
export const GOOGLE_ANDROID_CLIENT_ID =
  "80954200956-m16llml67fim8vakboegv0njosf7sm54.apps.googleusercontent.com";
