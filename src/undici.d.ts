// Type declarations for undici
declare module 'undici' {
  export function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
}
