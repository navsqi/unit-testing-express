class CustomError extends Error {
  public statusCode: number;
  public status: string;
  public isOperational: boolean;

  public date: string;
  public isAxiosError = false;

  public errorDetail: any;

  constructor(message: any, statusCode: number, date = new Date().toString(), errorDetail: any = null) {
    super(message);
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.statusCode = statusCode ? statusCode : 500;
    this.date = date;
    this.errorDetail = errorDetail;

    Error.captureStackTrace(this, this.constructor);
  }

  get HttpStatusCode() {
    return this.statusCode;
  }

  get JSON() {
    return {
      statusCode: this.statusCode,
      status: this.status,
      message: this.message || 'Something went wrong',
      error: this.stack,
      errorDetail: this.errorDetail,
      isOperational: this.isOperational,
      isAxiosError: this.isAxiosError,
      date: this.date,
    };
  }
}

export default CustomError;
