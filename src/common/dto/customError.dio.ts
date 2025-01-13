export class CustomError extends Error {
  status: number;
  data: { [key: string]: string | boolean };
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}
