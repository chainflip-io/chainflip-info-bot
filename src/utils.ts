const cleanupFns = new Set<() => void>();

export const handleExit = (fn: () => void) => {
  cleanupFns.add(fn);

  return () => {
    cleanupFns.delete(fn);
  };
};

const cleanup = () => {
  cleanupFns.forEach((fn) => fn());
  cleanupFns.clear();
};

process.once('SIGINT', cleanup);
process.once('SIGTERM', cleanup);
