import type { Preview } from "@storybook/react-vite"
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"

const preview: Preview = {
  globalTypes: {
    colorMode: {
      description: "Color mode for the RSI import UI",
      toolbar: {
        title: "Color mode",
        icon: "mirror",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorMode: "light",
  },
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    // RSI ships its own scoped provider; this one only styles the story chrome (Default.stories.tsx)
    (Story) => (
      <ChakraProvider value={defaultSystem}>
        <Story />
      </ChakraProvider>
    ),
  ],
}

export default preview
