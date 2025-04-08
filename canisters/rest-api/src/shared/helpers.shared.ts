export function transformBigIntToNumber(obj: any): any {
  // Handle null or undefined values
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    return Number(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformBigIntToNumber(item));
  }

  if (typeof obj === 'object') {
    try {
      return Object.fromEntries(
        Object.entries(obj).map(([key, value]) => [
          key,
          transformBigIntToNumber(value),
        ]),
      );
    } catch (error) {
      console.error('Error converting object:', error);
      return obj;
    }
  }

  return obj;
}
