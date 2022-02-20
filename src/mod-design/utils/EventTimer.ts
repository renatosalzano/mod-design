import { useRef } from "react";

export class EventTimer {
  private timer: NodeJS.Timeout | null = null;
  private reset() {
    this.timer = null;
  }
  timerRunning(ms: number) {
    if (this.timer) {
      /* timer is running */
      clearTimeout(this.timer);
      this.timer = setTimeout(() => this.reset(), ms);
      return true;
    } else {
      /* timer expired */
      this.timer = setTimeout(() => this.reset(), ms);
      return false;
    }
  }
}

export function useEventTimer() {
  const eventTimer = useRef(new EventTimer());
  return eventTimer.current;
}
