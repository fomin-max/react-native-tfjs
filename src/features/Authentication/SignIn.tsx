import React from 'react';
import {
  Button,
  Container,
  Content,
  Form,
  Input,
  Item,
  Label,
  Text,
} from 'native-base';

import { dispatch } from '../../store';

export const SignIn = (): React.ReactElement => {
  const [email, setEmail] = React.useState('tfjs-test@mail.ru');
  const [password, setPassword] = React.useState('Qwerty12345');

  const signIn = (): void => {
    dispatch.authentication.signIn({ email, password });
  };

  const isSignInButtonDisabled = !email || !password;

  return (
    <Container>
      <Content>
        <Form>
          <Item floatingLabel>
            <Label>Email</Label>
            <Input onChangeText={(text) => setEmail(text)} value={email} />
          </Item>
          <Item floatingLabel>
            <Label>Password</Label>
            <Input
              secureTextEntry
              onChangeText={(text) => setPassword(text)}
              value={password}
            />
          </Item>
        </Form>
        <Button
          rounded
          block
          disabled={isSignInButtonDisabled}
          onPress={signIn}
        >
          <Text>Sign In</Text>
        </Button>
      </Content>
    </Container>
  );
};
