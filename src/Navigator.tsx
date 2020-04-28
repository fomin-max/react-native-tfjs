import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import {
  InitialState,
  NavigationContainer,
  useLinking,
} from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { Authentication } from './screens/Authentication';
import { SamplePage } from './screens/SamplePage';
import { isLoadingSelector } from './features/Loaders/selectors';
import { Splash } from './screens/Splash';
import { credentialsSelector } from './features/Keychain/selectors';
import { isNotEmpty } from './utils/helpers';
import { Loader } from './features/Loaders/enums';
import { APP_PREFIXES, Screen } from './constants';

export const Stack = createStackNavigator();

export const Navigator = (): React.ReactElement => {
  const ref = React.useRef();

  const [isReady, setIsReady] = React.useState(false);

  const { getInitialState } = useLinking(ref, {
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
    <NavigationContainer initialState={initialState} ref={ref}>
      <Stack.Navigator>
        {isSignedIn ? (
          <>
            <Stack.Screen name={Screen.SamplePage} component={SamplePage} />
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