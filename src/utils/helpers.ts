import fp from 'lodash/fp';

import { Profile } from '../features/Profile/types';

export const isNotEmpty = fp.complement(fp.isEmpty);

export const isNotNil = fp.complement(fp.isNil);

export const getFullName = ({
  firstName,
  middleName,
  lastName,
}: Partial<Profile>): string => [lastName, firstName, middleName].join(' ');
