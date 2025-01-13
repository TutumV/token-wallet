export const responseMatrix: Record<string, {message: string; status: number}> = {
  10000: {
    message: 'OK',
    status: 200,
  },
  10001: {
    message: 'Created',
    status: 201,
  },
  10002: {
    message: 'Updated',
    status: 200,
  },
  10003: {
    message: 'Resource not found',
    status: 404,
  },
  10004: {
    message: 'Object not found',
    status: 404,
  },
  10005: {
    message: 'Internal Error',
    status: 500,
  },
  10006: {
    message: 'Validation Error',
    status: 400,
  },
  10007: {
    message: 'Insufficient Funds Error',
    status: 400,
  },
  10008: {
    message: 'Invalid Mnemonic',
    status: 400,
  },
};
