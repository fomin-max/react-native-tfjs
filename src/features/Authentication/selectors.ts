import { AppState } from '../../store/types';

const authenticationStateSelector = (
  state: AppState,
): AppState['authentication'] => state.authentication;
