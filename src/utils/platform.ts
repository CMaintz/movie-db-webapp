/** Returns true when running inside a webOS TV environment. */
export const isTV = (): boolean =>
  typeof (window as any).webOS !== 'undefined';
