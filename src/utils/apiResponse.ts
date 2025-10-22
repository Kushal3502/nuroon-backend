export class ApiResponse<T> {
  data: object;
  message: string;
  success: boolean;

  constructor(
    statusCode: number,
    message: string = 'Success',
    data: object = {},
  ) {
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
  }
}
