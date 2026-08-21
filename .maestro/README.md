# Maestro E2E flows

Real, on-device end-to-end tests (as opposed to the `@testing-library/react-native`
integration tests under `src/`, which render components in a test renderer,
never touching an actual Android/iOS build).

## Layout

- `flows/` — one flow per feature/screen. Run these directly.
- `subflows/` — shared building blocks (e.g. login). Not meant to be run on
  their own; referenced via `runFlow` from files in `flows/`.

## Running

```bash
# Install once (adds `maestro` to PATH via ~/.bashrc / ~/.zshrc)
curl -Ls "https://get.maestro.mobile.dev" | bash

# Windows/Git Bash: Maestro's console output mis-encodes Vietnamese text
# unless the JVM is forced to UTF-8. Also needed if `maestro` isn't yet
# on PATH in a fresh shell.
export PATH="$PATH":"$HOME/.maestro/bin"
export JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -Dstdout.encoding=UTF-8 -Dstderr.encoding=UTF-8"

npm run e2e
# or a single flow:
maestro --device emulator-5554 test .maestro/flows/leaderboard.yaml
```

Flows assume the device is already logged in (session now survives
`launchApp` — see Known Issues #2, fixed). If the device is logged out, log
in once by hand (`subflows/login.yaml` documents the steps, but see Known
Issues #1 for why it can't currently drive the form itself).

## Known issues in this dev environment (Windows + this Android emulator)

1. **`inputText` hangs and times out (`DeviceServerDiedException`, 120s
   deadline) whenever the login form is being filled in.** Confirmed via
   direct `adb shell input text "..."` (which works fine and instantly) that
   this is specific to Maestro's Android driver bridge, not the app, the
   emulator, or ADB in general. Likely related to Gboard's floating
   toolbar/tip popups intercepting the input connection (see issue #3). As a
   result, `subflows/login.yaml` is written correctly but **cannot currently
   complete a `maestro test` run unattended** — it will hang for ~2 minutes
   and fail on the `inputText` step. This no longer blocks flows that don't
   need to log in themselves (see #2), but a flow that must start from a
   logged-out state still needs a manual login first. Try a system image
   without Gboard, a Maestro version bump, or `adb shell ime set` to a plain
   AOSP keyboard if one gets installed.

2. **~~The app did not persist the session across a cold process
   restart~~ — fixed 2026-08-21.** `src/app/index.tsx` was redirecting to
   `/welcome` based on `isAuthenticated`/`isLoading` before the persisted
   session had actually been read back (`AuthProvider` initialized
   `isLoading` to `false` instead of `true`). Fixed in
   `src/contexts/auth-context.tsx`; verified with two consecutive
   force-stop+relaunch cycles. `launchApp` (no `clearState`) now correctly
   resumes an already-logged-in session, which is what `flows/leaderboard.yaml`
   relies on.

3. **A "Open debugger to view warnings." dev banner** sits at the bottom of
   the screen and overlaps the welcome screen's buttons, swallowing taps
   meant for them. `subflows/login.yaml` dismisses it conditionally before
   tapping. Gboard also occasionally shows its own onboarding tip banner
   ("Check out useful Gboard tools...") that overlaps form buttons the same
   way — not yet handled in the flow since it wasn't consistently
   reproducible; dismiss it manually if a flow run stalls on a tap.

4. **A tab's label can render as an ellipsis-truncated string when
   active** (e.g. the leaderboard tab reads as "Xếp ..." instead of "Xếp
   hạng" once selected, because the active tab's pill expands and the label
   has less room). `tapOn: "Xếp hạng"` only matches while the tab is
   *inactive*. `flows/leaderboard.yaml` taps "Học" first for this reason —
   do the same in any new flow that re-selects an already-active tab.

## Test account

See the `nicek92408@gmai.com` credentials in this session's memory
(`reference_test_account.md`) — note the real domain is `gmai.com`, not a
typo-corrected `gmail.com`.
