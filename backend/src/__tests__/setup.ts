// Fix Node 20+ Jest local storage conflict
if (typeof globalThis.localStorage !== 'undefined') {
  Object.defineProperty(globalThis, 'localStorage', {
    value: undefined,
    writable: true,
  });
}
