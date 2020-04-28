import axios from 'axios';

import { ServerError } from './ServerError';

export const createServerErrorInterceptor = (): void => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => Promise.reject(new ServerError(error)),
  );
};
