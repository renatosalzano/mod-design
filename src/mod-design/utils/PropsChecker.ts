export class PropsChecker {
  name: string = "UNKNOW";
  type: string;
  error: boolean = false;
  constructor(type: string, name?: string, ...args: any[]) {
    this.type = type;
    if (name) {
      this.name = name;
    } else {
      this.error = true;
    }
  }
}
