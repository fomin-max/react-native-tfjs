import React from 'react';
import { Spinner, View } from 'native-base';

import { styles } from './Splash.styles';

export const Splash = (): React.ReactElement => (
  <View style={styles.container}>
    <Spinner color="black" />
  </View>
);
