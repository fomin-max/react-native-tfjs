import { loaders } from '../features/Loaders/model';
import { application } from '../features/Application/model';
import { authentication } from '../features/Authentication/model';
import { profile } from '../features/Profile/model';
import { errors } from '../features/Errors/model';
import { keyChain } from '../features/Keychain/model';

export interface RootModel {
  loaders: typeof loaders,
  application: typeof application,
  authentication: typeof authentication,
  keyChain: typeof keyChain,
  profile: typeof profile,
  errors: typeof errors,
}

export const models: RootModel = {
  loaders,
  application,
  authentication,
  profile,
  errors,
  keyChain,
};
