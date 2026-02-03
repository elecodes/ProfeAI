import type { Meta, StoryObj } from '@storybook/react';
import SignInForm from '../components/auth/SignInForm';
import SignUpForm from '../components/auth/SignUpForm';

const meta: Meta = {
  title: 'Auth/Forms',
  parameters: {
    layout: 'centered',
  },
};

export default meta;

export const Login: StoryObj<typeof SignInForm> = {
  render: () => <SignInForm onSubmit={async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Login data:', data);
  }} />,
};

export const Register: StoryObj<typeof SignUpForm> = {
  render: () => <SignUpForm onSubmit={async (data) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Register data:', data);
  }} />,
};
