import React from 'react';
import FlashcardText from '../components/FlashcardText';

export default {
    title: 'Components/FlashcardText',
    component: FlashcardText,
    tags: ['autodocs'],
    argTypes: {
        english: { control: 'text' },
        spanish: { control: 'text' },
        showTranslation: { control: 'boolean' },
    },
};

const Template = (args) => <div className="p-4 border rounded shadow-sm bg-white max-w-sm text-center"><FlashcardText {...args} /></div>;

export const Hidden = Template.bind({});
Hidden.args = {
    english: 'Hello, friend!',
    spanish: '¡Hola, amigo!',
    showTranslation: false,
};

export const Revealed = Template.bind({});
Revealed.args = {
    english: 'Hello, friend!',
    spanish: '¡Hola, amigo!',
    showTranslation: true,
};
