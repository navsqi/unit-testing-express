interface GeneralServiceResponse<T> {
  error: boolean;
  data: T | null;
  msg: string | null;
  statusCode: number;
}

export default GeneralServiceResponse;
