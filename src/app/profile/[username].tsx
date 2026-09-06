import React from "react";
import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Deep link backward-compatibility redirect screen.
 * Redirects `/profile/[username]` (e.g. `nihongo://profile/@user` or `/profile/user`)
 * to the canonical friends profile route: `/friends/profile/[username]`.
 */
export default function LegacyProfileRedirect() {
  const { username } = useLocalSearchParams<{ username: string }>();
  const cleanUsername = (username || "").replace(/^@+/, "").trim();

  return <Redirect href={`/friends/profile/${cleanUsername}`} />;
}
