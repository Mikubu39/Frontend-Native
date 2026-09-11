/**
 * Motion language — 墨と印 (sumi to in, "ink and seal").
 *
 * The app's motion is built from the materials the subject is actually made
 * of: sumi ink soaking into washi, a hanko pressed onto paper, hardwood
 * clappers, a struck bronze bowl. Nothing in this system bounces like rubber.
 * Things press, bleed, snap and settle.
 *
 * Why this exists rather than more springs: `AnimationPresets` in
 * `constants/theme.ts` offers four springs that differ only in damping, so
 * every element in the app — a tab icon, a wrong answer, a completed lesson —
 * moves with the same rubbery overshoot and none of them read as a distinct
 * event. These tokens are named after the gesture they perform, so choosing
 * one is a decision about what is happening, not about how bouncy it looks.
 *
 * Use `AnimationPresets` for pressable feedback (it is tuned for that and is
 * used everywhere); reach for `Motion` when an event needs to read as a
 * specific physical action.
 */

import {
  Easing,
  withDelay,
  withSequence,
  withTiming,
  type SharedValue,
  type WithTimingConfig,
} from "react-native-reanimated";

/**
 * Curves, each matched to a real gesture.
 *
 * `ink` and `snap` both start fast, but `ink` keeps travelling for a long
 * quiet tail the way pigment creeps outward through paper fibres, while
 * `snap` arrives and stops dead like two blocks of wood meeting.
 */
export const MotionEasing = {
  /** Sumi hitting washi: immediate, then a long decelerating spread. */
  ink: Easing.bezier(0.16, 1, 0.3, 1),
  /** A hanko coming down: hesitates, then falls hard onto the paper. */
  press: Easing.bezier(0.68, 0, 0.18, 1),
  /** Hyoshigi clack: arrives and stops. Zero overshoot, by design. */
  snap: Easing.bezier(0.2, 0, 0, 1),
  /** Washi sliding across a desk: even, unhurried, never springs back. */
  paper: Easing.bezier(0.33, 0, 0.15, 1),
  /** Something struck, losing energy. */
  settle: Easing.out(Easing.quad),
  /** Something winding up before it moves. */
  gather: Easing.in(Easing.cubic),
} as const;

/**
 * Durations, named after the event rather than after a t-shirt size, so the
 * wrong one is obvious at the call site.
 */
export const MotionDuration = {
  /** A tick of feedback — selection, toggle. */
  tick: 90,
  /** A state change the user caused directly. */
  snap: 170,
  /** A seal coming down. */
  press: 260,
  /** Ink spreading outward. */
  bleed: 540,
  /** A struck object coming to rest. */
  settle: 820,
} as const;

/**
 * Springs that stop. Both are damped past the point of oscillation — they
 * exist so a component can use spring physics for the arrival without
 * inheriting the bounce that reads as generic.
 */
export const MotionSpring = {
  /** Seal impact: fast, heavy, one small recoil and done. */
  seal: { damping: 26, stiffness: 420, mass: 0.9 },
  /** Panel arrival: firm, no visible overshoot. */
  panel: { damping: 30, stiffness: 260, mass: 1 },
} as const;

/** Stagger step for an orchestrated reveal. Deliberately slower than a
 *  typical 50 ms list stagger: at 50 ms a group reads as one blurred event,
 *  at 90 ms the eye can follow the order the designer intended. */
export const MotionStagger = 90;

export function staggerAt(index: number, step: number = MotionStagger): number {
  "worklet";
  return index * step;
}

const instant: WithTimingConfig = { duration: 0 };

/**
 * The error shake, rebuilt.
 *
 * A uniform `-10, +10, -10, +10, 0` at a constant duration is the shake every
 * generated interface ships: constant amplitude and constant period read as a
 * wobble, because no real object oscillates that way. A struck object loses
 * amplitude on every swing and its period lengthens as it settles, so this
 * runs 1.00 → 0.62 → 0.34 → 0.16 → 0 over 38 → 46 → 58 → 72 → 96 ms.
 *
 * Returns the animation rather than assigning it, so callers keep control of
 * the shared value and can compose it.
 */
export function struckShake(
  amplitude: number = 12,
  reduceMotion: boolean = false,
) {
  "worklet";
  if (reduceMotion) {
    return withTiming(0, instant);
  }
  return withSequence(
    withTiming(-amplitude, {
      duration: 38,
      easing: MotionEasing.settle,
    }),
    withTiming(amplitude * 0.62, {
      duration: 46,
      easing: MotionEasing.paper,
    }),
    withTiming(-amplitude * 0.34, {
      duration: 58,
      easing: MotionEasing.paper,
    }),
    withTiming(amplitude * 0.16, {
      duration: 72,
      easing: MotionEasing.paper,
    }),
    withTiming(0, { duration: 96, easing: MotionEasing.paper }),
  );
}

/**
 * Ink bleeding outward from a point: appears at full strength, spreads, fades.
 * Drive a scale value with `bleedScale` and an opacity with `bleedOpacity` so
 * the two stay locked to the same timing.
 */
export function bleedScale(
  to: number = 2.4,
  duration: number = MotionDuration.bleed,
  reduceMotion: boolean = false,
) {
  "worklet";
  if (reduceMotion) return withTiming(to, instant);
  return withTiming(to, { duration, easing: MotionEasing.ink });
}

export function bleedOpacity(
  peak: number = 0.4,
  duration: number = MotionDuration.bleed,
  reduceMotion: boolean = false,
) {
  "worklet";
  if (reduceMotion) return withTiming(0, instant);
  return withSequence(
    withTiming(peak, { duration: 60, easing: MotionEasing.snap }),
    withTiming(0, {
      duration: duration - 60,
      easing: MotionEasing.settle,
    }),
  );
}

/**
 * A seal coming down onto paper: lift and hold, drop past the resting size,
 * then settle. The overshoot happens on the way *down* (the stamp is still
 * large when it lands) rather than as a bounce afterwards, which is the
 * difference between stamping and boinging.
 */
export function sealPress(delay: number = 0, reduceMotion: boolean = false) {
  "worklet";
  if (reduceMotion) {
    return withDelay(0, withTiming(1, instant));
  }
  return withDelay(
    delay,
    withSequence(
      withTiming(1.55, { duration: 0 }),
      withTiming(1.42, { duration: 110, easing: MotionEasing.gather }),
      withTiming(0.965, { duration: 130, easing: MotionEasing.press }),
      withTiming(1, { duration: 180, easing: MotionEasing.paper }),
    ),
  );
}

/**
 * Set a shared value with the app's standard reveal, honouring reduced motion
 * without every call site repeating the same ternary.
 */
export function reveal(
  sv: SharedValue<number>,
  to: number,
  {
    delay = 0,
    duration = MotionDuration.press,
    easing = MotionEasing.ink,
    reduceMotion = false,
  }: {
    delay?: number;
    duration?: number;
    easing?: WithTimingConfig["easing"];
    reduceMotion?: boolean;
  } = {},
) {
  "worklet";
  sv.value = reduceMotion
    ? withTiming(to, instant)
    : withDelay(delay, withTiming(to, { duration, easing }));
}
