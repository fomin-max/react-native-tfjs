import { createSelector } from 'reselect';
import fp from 'lodash/fp';

import { AppState } from '../../store';

const keyChainStateSelector = (
  state: AppState,
): AppState['keyChain'] => state.keyChain;

export const credentialsSelector = createSelector(
  keyChainStateSelector,
  fp.prop('credentials'),
);
