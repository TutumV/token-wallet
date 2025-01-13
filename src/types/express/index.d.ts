export {};

declare global {
  namespace Express {
    export interface Response {
      sendRes(code: number, body?: object): void;
      catchError(e: unknown): void;
    }
  }
}
