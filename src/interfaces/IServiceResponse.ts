import { Boom } from '@hapi/boom';

export interface IServiceResponse<TRes> {
  error: Boom | null;
  payload: TRes | null;
}
