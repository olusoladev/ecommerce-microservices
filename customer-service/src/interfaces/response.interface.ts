export interface IResponse<T> {
  data?: T;
  status: number;
  message: string;
}

export interface GenericResponse {};