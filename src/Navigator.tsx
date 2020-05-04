import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  InitialState,
  NavigationContainer,
  NavigationContainerRef,
  useLinking,
} from '@react-navigation/native';
import { useSelector } from 'react-redux';
import '@tensorflow/tfjs-react-native';
import * as tf from '@tensorflow/tfjs';

import { Authentication } from './screens/Authentication';
import { SamplePage, Realtime } from './screens';
import { isLoadingSelector } from './features/Loaders/selectors';
import { Splash } from './screens/Splash';
import { credentialsSelector } from './features/Keychain/selectors';
import { isNotEmpty } from './utils/helpers';
import { Loader } from './features/Loaders/enums';
import { APP_PREFIXES, Screen } from './constants';

export const Stack = createStackNavigator();

export const Navigator = (): React.ReactElement => {
  const navigationContainerRef = React.useRef<NavigationContainerRef>(null);

  const [isReady, setIsReady] = React.useState(false);
  const [isTfReady, setIsTfReady] = React.useState(false);

  const { getInitialState } = useLinking(navigationContainerRef, {
    prefixes: APP_PREFIXES,
    config: {
      [Screen.Authentication]: 'authentication',
    },
  });

  const [initialState, setInitialState] = React.useState<
    InitialState | undefined
  >();

  const isApplicationInitializing = useSelector(
    isLoadingSelector(Loader.InitializeApplication),
  );

  const checkTfReady = async (): Promise<void> => {
    // Wait for tf to be ready.
    await tf.ready();

    // Signal to the app that tensorflow.js can now be used.
    setIsTfReady(true);
  };

  const credentials = useSelector(credentialsSelector);

  React.useEffect(() => {
    Promise.race<ReturnType<typeof getInitialState> | undefined>([
      getInitialState(),
      new Promise((resolve) => setTimeout(resolve, 150)),
    ]).then((state) => {
      if (state !== undefined) {
        setInitialState(state);
      }

      setIsReady(true);
      // TODO: выяснить в чем трабл
      checkTfReady()
        .then(() => {
          console.log('then isTfReady', isTfReady);
        })
        .catch(error => {
          console.log('error', error);
        });
    });
  }, [getInitialState]);

  const isSignedIn = isNotEmpty(credentials);

  if (isApplicationInitializing || !isReady) {
    return <Splash />;
  }

  return (
    <NavigationContainer initialState={initialState} ref={navigationContainerRef}>
      <Stack.Navigator>
        {isSignedIn ? (
          <>
            <Stack.Screen name={Screen.SamplePage} component={SamplePage} />
            <Stack.Screen name={Screen.Realtime} component={Realtime} />
          </>
        ) : (
          <>
            <Stack.Screen
              name={Screen.Authentication}
              component={Authentication}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
