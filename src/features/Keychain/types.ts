import * as Keychain from 'react-native-keychain';

export interface SetGenericPasswordPayload {
  username: string,
  password: string,
}

export interface KeychainState {
  credentials: Partial<Keychain.UserCredentials>,
}
