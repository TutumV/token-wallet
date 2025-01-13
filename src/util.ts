export class CodeError extends Error {
  code: number;
  constructor(code: number) {
    super(code.toString());
    this.name = 'CodeError';
    this.code = code;
  }
}
