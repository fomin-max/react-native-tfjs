import React from 'react';
import 'react-native-gesture-handler';
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
import { SamplePage } from './screens/SamplePage';
import { isLoadingSelector } from './features/Loaders/selectors';
import { Splash } from './screens/Splash';
import { credentialsSelector } from './features/Keychain/selectors';
import { isNotEmpty } from './utils/helpers';
import { Loader } from './features/Loaders/enums';
import { APP_PREFIXES, Screen } from './constants';
import { RealtimeDemo } from './features/Realtime/Realtime';

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
    await tf.setBackend('rn-webgl');
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

      checkTfReady()
        .then(() => {
          console.log('then');
        })
        .catch((error) => {
          console.log('error', error);
        });
    });
  }, [getInitialState]);

  React.useEffect(() => {
    if (isTfReady) {
      const runMultiplication = async (x: number, y: number): Promise<void> => {
        const result = await tf
          .scalar(x)
          .mul(tf.scalar(y))
          .array();
        console.log('result', result);
        // setResult(result[0]);
      };
      runMultiplication(4125, 1732);
    }
  }, [isTfReady]);

  const isSignedIn = isNotEmpty(credentials);

  if (isApplicationInitializing || !isReady) {
    return <Splash />;
  }
  console.log('isTfReady', isTfReady);
  return (
    <NavigationContainer
      initialState={initialState}
      ref={navigationContainerRef}
    >
      <Stack.Navigator>
        {isSignedIn ? (
          <>
            <Stack.Screen name={Screen.SamplePage} component={SamplePage} />
            <Stack.Screen name={Screen.RealtimeDemo} component={RealtimeDemo} />
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
