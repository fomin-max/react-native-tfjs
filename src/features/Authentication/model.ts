import { SignInPayload } from './types';
import { Dispatch, getState } from '../../store';
import { credentialsSelector } from '../Keychain/selectors';

export const authentication = {
  state: {},
  reducers: {},
  effects: (dispatch: Dispatch) => ({
    signIn: async ({ email, password }: SignInPayload) => {
      const state = getState();

      const credentials = credentialsSelector(state);

      // Если пользователь авторизуется впервые, сохряем username/password в KeyChain
      if (!credentials) {
        await dispatch.keyChain.setGenericPassword({
          username: email,
          password,
        });
      }

      await dispatch.profile.getUser();
    },
    // очищаем KeyChain
    signOut: async () => {
      try {
        await dispatch.keyChain.resetGenericPassword();
      } catch (error) {
        dispatch.errors.throwError(error);
      }
    },
  }),
};
