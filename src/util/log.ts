const ts = () => new Date().toISOString();

export const log = {
  info: (tag: string, msg: string, ...args: unknown[]) =>
    console.log(`${ts()} [${tag}] ${msg}`, ...args),
  error: (tag: string, msg: string, ...args: unknown[]) =>
    console.error(`${ts()} [${tag}] ${msg}`, ...args),
};
