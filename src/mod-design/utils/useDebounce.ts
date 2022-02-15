export class Debounce {
  private timeout: NodeJS.Timeout;
  constructor() {
    this.timeout = setTimeout(() => null, 0);
  }
  debounce(callback: (...args: any[]) => any, delay: number) {
    this.timeout = setTimeout(callback, delay);
    return this.timeout;
  }
  cancel() {
    clearTimeout(this.timeout);
  }
}

export class ClickInRange {
  private timer: NodeJS.Timeout | null = null;
  private reset() {
    this.timer = null;
  }
  clickInRange(ms: number) {
    if (this.timer) {
      console.log("range");
      this.timer = setTimeout(() => this.reset(), ms);
      return true;
    } else {
      this.timer = setTimeout(() => this.reset(), ms);
      return false;
    }
  }
}
