import { RematchDispatch, RematchRootState } from '@rematch/core';
import { RootModel } from './models';

export type AppState = RematchRootState<RootModel>;
export type Dispatch = RematchDispatch<RootModel>;
