export const unreachable = (value: never, message: string): never => {
  throw new Error(message);
};
