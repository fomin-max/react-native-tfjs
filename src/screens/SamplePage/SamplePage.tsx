import React from 'react';
import { Button, Container, Content, Text } from 'native-base';
import PushNotification, {
  PushNotificationPermissions,
} from 'react-native-push-notification';
import TouchID from 'react-native-touch-id';
import { Alert } from 'react-native';
import { useSelector } from 'react-redux';

import { dispatch } from '../../store';
import { profileStateSelector } from '../../features/Profile/selectors';
import { getFullName } from '../../utils/helpers';

export const SamplePage = (): React.ReactElement | null => {
  const [permissions, setPermissions] = React.useState<
    PushNotificationPermissions
  >({});

  const userProfile = useSelector(profileStateSelector);

  React.useEffect(() => {
    PushNotification.checkPermissions(setPermissions);

    PushNotification.configure({
      onNotification: (notification) => {
        console.log(notification);
      },
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
        <Button onPress={() => dispatch.authentication.signOut()}>
          <Text>Sign Out</Text>
        </Button>
      </Content>
    </Container>
  );
};
