import Keychain from 'react-native-keychain';

import { AppState, Dispatch } from '../../store';
import { KeychainState, SetGenericPasswordPayload } from './types';

export const keyChain = {
  state: {} as Partial<KeychainState>,
  reducers: {
    setCredentials: (
      state: AppState,
      credentials: KeychainState['credentials'],
    ) => ({
      ...state,
      credentials,
    }),
  },
  effects: (dispatch: Dispatch) => ({
    // Сохранение пары username/password в KeyChain в зашифрованном виде
    setGenericPassword: async ({
      username,
      password,
    }: SetGenericPasswordPayload) => {
      const result = await Keychain.setGenericPassword(username, password);

      if (result) {
        dispatch.keyChain.setCredentials({
          ...result,
          username,
          password,
        });
      }
    },
    // Получение пары username/password из KeyChain в расшифрованном виде
    getGenericPassword: async () => {
      const credentials = await Keychain.getGenericPassword();

      if (credentials) {
        dispatch.keyChain.setCredentials(credentials);
      }
    },
    // Очищение KeyChain
    resetGenericPassword: async () => {
      const result = await Keychain.resetGenericPassword();

      if (result) {
        dispatch.keyChain.setCredentials({});
      }
    },
  }),
};
