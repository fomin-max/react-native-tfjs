import React from 'react';
import { Provider } from 'react-redux';

import { dispatch, store } from './store';
import { Navigator } from './Navigator';
import { createServerErrorInterceptor } from './features/Errors/createServerErrorInterceptor';

createServerErrorInterceptor();

// dispatch.application.initializeApplication();

export const App = (): React.ReactElement => (
  <Provider store={store}>
    <Navigator />
  </Provider>
);
