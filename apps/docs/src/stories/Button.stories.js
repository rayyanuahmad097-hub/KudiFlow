"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Small = exports.Large = exports.Secondary = exports.Primary = void 0;
const test_1 = require("storybook/test");
const Button_1 = require("./Button");
// // More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
// const meta = {
//   title: 'Example/Button',
//   component: Button,
//   parameters: {
//     // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
//     layout: 'centered',
//   },
//   // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
//   tags: ['autodocs'],
//   // More on argTypes: https://storybook.js.org/docs/api/argtypes
//   argTypes: {
//     backgroundColor: { control: 'color' },
//   },
//   // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
//   args: { onClick: fn() },
// } satisfies Meta<typeof Button>;
// export default meta;
// type Story = StoryObj<typeof meta>;
// // More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
// export const Primary: Story = {
//   args: {
//     primary: true,
//     label: 'Button',
//   },
// };
// export const Secondary: Story = {
//   args: {
//     label: 'Button',
//   },
// };
// export const Large: Story = {
//   args: {
//     size: 'large',
//     label: 'Button',
//   },
// };
// export const Small: Story = {
//   args: {
//     size: 'small',
//     label: 'Button',
//   },
// };
// import type { Meta, StoryObj } from '@storybook/react';
// import { fn } from '@storybook/test';
// import { Button } from './Button';
const meta = {
    title: 'Components/Button', // ← Changed from 'Example/Button' to 'Components/Button'
    component: Button_1.Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'], // ← This enables auto-documentation
    argTypes: {
        backgroundColor: { control: 'color' },
        size: {
            control: 'select',
            options: ['small', 'medium', 'large'],
        },
    },
    args: { onClick: (0, test_1.fn)() },
};
exports.default = meta;
exports.Primary = {
    args: {
        primary: true,
        label: 'Button',
    },
};
exports.Secondary = {
    args: {
        label: 'Button',
    },
};
exports.Large = {
    args: {
        size: 'large',
        label: 'Button',
    },
};
exports.Small = {
    args: {
        size: 'small',
        label: 'Button',
    },
};
//# sourceMappingURL=Button.stories.js.map