export function isValidDate(date: any) {
  if (date instanceof Date) {
    if (isNaN(date.getTime())) {
      // ERROR
      return false;
    } else {
      return true;
    }
  } else return false;
}

export function isEqualDate(x: Date | null, y: Date | null) {
  if (x instanceof Date && y instanceof Date) {
    if (isValidDate(x) && isValidDate(y)) {
      const _x = new Date(x).getTime();
      const _y = new Date(y).getTime();
      return _x === _y;
    } else return false;
  } else {
    return false;
  }
}
