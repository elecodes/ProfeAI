import type { Meta, StoryObj } from '@storybook/react';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';

const meta: Meta = {
  title: 'Auth/Forms',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Login: StoryObj<typeof LoginForm> = {
  render: () => <LoginForm onSubmit={async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Login data:', data);
  }} />,
};

export const Register: StoryObj<typeof RegisterForm> = {
  render: () => <RegisterForm onSubmit={async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Register data:', data);
  }} />,
};
