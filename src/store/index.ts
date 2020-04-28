import { init, RematchDispatch, RematchRootState } from '@rematch/core';

import { models } from './models';

export const store = init({
  models,
});

export const { dispatch, getState } = store;

export type AppState = RematchRootState<typeof models>;
export type Dispatch = RematchDispatch<typeof models>;
