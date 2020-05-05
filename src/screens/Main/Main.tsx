import React from 'react';
import { Button, Container, Content, Text } from 'native-base';
import PushNotification, {
  PushNotificationPermissions,
} from 'react-native-push-notification';
import TouchID from 'react-native-touch-id';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as tf from '@tensorflow/tfjs';

import { dispatch } from '../../store';
import { profileStateSelector } from '../../features/Profile/selectors';
import { getFullName } from '../../utils/helpers';
import { Screen } from '../../constants';
import { RootStackParamList } from '../../Navigator';

type MainScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  Screen.Main
>;

export const Main = (): React.ReactElement | null => {
  const [permissions, setPermissions] = React.useState<
    PushNotificationPermissions
  >({});
  const [isTfReady, setIsTfReady] = React.useState<boolean>(false);

  const navigation = useNavigation<MainScreenNavigationProp>();

  const userProfile = useSelector(profileStateSelector);

  const checkTfReady = async (): Promise<void> => {
    // Wait for tf to be ready.
    await tf.ready();

    // Signal to the app that tensorflow.js can now be used.
    setIsTfReady(true);
  };

  React.useEffect(() => {
    PushNotification.checkPermissions(setPermissions);

    PushNotification.configure({
      onNotification: (notification) => {
        console.log(notification);
      },
    });

    checkTfReady()
      .then(() => setIsTfReady(true))
      .catch((error) => {
        dispatch.errors.throwError(error);
      });
  }, []);

  const authenticate = (): void => {
    TouchID.isSupported()
      .then(() => {
        TouchID.authenticate()
          .then(() => {
            Alert.alert('Authenticated!');
          })
          .catch(() => {
            Alert.alert('Not Authenticated!');
          });
      })
      .catch(() => {
        Alert.alert('TouchID is not supported!');
      });
  };

  const sendLocalNotification = (): void => {
    PushNotification.localNotification({
      title: 'Заголовок',
      message: 'Привет, Мир!',
    });
  };

  const handleGoToRealTimeDetectionScreen = (): void => {
    navigation.push(Screen.RealTimeDetection);
  };

  const handleGoToAuthenticationScreen = (): void => {
    navigation.push(Screen.Authentication);
  };

  if (!userProfile) return null;

  const fullName = getFullName(userProfile);

  return (
    <Container>
      <Content>
        <Text>Добро пожаловать, {fullName}!</Text>
        {permissions.alert && (
          <Button primary onPress={sendLocalNotification}>
            <Text>Send Push Notification</Text>
          </Button>
        )}
        <Button primary onPress={authenticate}>
          <Text>Enter with Touch ID</Text>
        </Button>
        <Button
          primary
          onPress={handleGoToRealTimeDetectionScreen}
          disabled={!isTfReady}
        >
          <Text>Real Time Detection</Text>
        </Button>
        <Button onPress={handleGoToAuthenticationScreen}>
          <Text>Sign Out</Text>
        </Button>
      </Content>
    </Container>
  );
};
