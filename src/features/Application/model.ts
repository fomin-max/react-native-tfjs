import { Dispatch, getState } from '../../store';
import { SignInPayload } from '../Authentication/types';
import { Loader } from '../Loaders/enums';
import { credentialsSelector } from '../Keychain/selectors';

export const application = {
  state: {},
  reducers: {},
  effects: (dispatch: Dispatch) => ({
    initializeApplication: async () => {
      dispatch.loaders.show(Loader.InitializeApplication);

      // Если пользователь уже был авторизован в приложении, получаем username и password из KeyChain
      await dispatch.keyChain.getGenericPassword();

      const state = getState();

      const credentials = credentialsSelector(state);

      if (credentials) {
        const { username, password } = credentials;

        // Авторизуемся существующей парой username и password
        await dispatch.authentication.signIn({
          email: username,
          password,
        } as SignInPayload);
      }

      dispatch.loaders.hide(Loader.InitializeApplication);
    },
  }),
};
