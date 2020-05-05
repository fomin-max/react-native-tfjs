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

import { Main, RealTimeDetection, Authentication } from './screens';
import { isLoadingSelector } from './features/Loaders/selectors';
import { Splash } from './screens/Splash';
import { credentialsSelector } from './features/Keychain/selectors';
import { isNotEmpty } from './utils/helpers';
import { Loader } from './features/Loaders/enums';
import { APP_PREFIXES, Screen } from './constants';

export type RootStackParamList = {
  [Screen.Main]: undefined,
  [Screen.Authentication]: undefined,
  [Screen.RealTimeDetection]: undefined,
};

export const Stack = createStackNavigator<RootStackParamList>();

export const Navigator = (): React.ReactElement => {
  const navigationContainerRef = React.useRef<NavigationContainerRef>(null);

  const [isReady, setIsReady] = React.useState(false);

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
    });
  }, [getInitialState]);

  const isSignedIn = isNotEmpty(credentials);

  if (isApplicationInitializing || !isReady) {
    return <Splash />;
  }

  return (
    <NavigationContainer
      initialState={initialState}
      ref={navigationContainerRef}
    >
      <Stack.Navigator>
        {isSignedIn ? (
          <>
            <Stack.Screen name={Screen.Main} component={Main} />
            <Stack.Screen
              name={Screen.RealTimeDetection}
              component={RealTimeDetection}
            />
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
