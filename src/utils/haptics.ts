/**
 * Native Haptic Touch Feedback Utility for Android / Mobile PWA
 * Uses the Web Vibration API with safe fallback for desktop / unsupported browsers.
 */

export type HapticType =
  | "light"
  | "medium"
  | "heavy"
  | "selection"
  | "success"
  | "warning"
  | "error";

export function triggerHaptic(type: HapticType = "light"): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) {
    return;
  }

  try {
    switch (type) {
      case "light":
      case "selection":
        // Crisp 10ms micro-tap for tabs, pills, and toggles
        navigator.vibrate(10);
        break;
      case "medium":
        // 22ms distinct tap for add-to-cart, cart open/close
        navigator.vibrate(22);
        break;
      case "heavy":
        // 40ms firm physical feedback for primary actions
        navigator.vibrate(40);
        break;
      case "success":
        // Double pulse for order placement, coupon success, etc.
        navigator.vibrate([15, 50, 25]);
        break;
      case "warning":
        // Warning double buzz
        navigator.vibrate([25, 40, 25]);
        break;
      case "error":
        // Triple buzz for invalid password or card error
        navigator.vibrate([35, 40, 35, 40, 45]);
        break;
      default:
        navigator.vibrate(12);
    }
  } catch {
    // Fail silently in environments where vibration is blocked or restricted
  }
}
