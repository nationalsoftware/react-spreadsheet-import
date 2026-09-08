import type { StorybookConfig } from "@storybook/react-vite"
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // @chakra-ui/react advertises its hosted Storybook; without this it gets auto-composed into our sidebar
  refs: {
    "@chakra-ui/react": { disable: true },
  },
  staticDirs: ["../src/stories/static"],
}
export default config
