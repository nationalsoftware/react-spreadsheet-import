import type { Preview } from "@storybook/react-vite"
import { ChakraProvider, defaultSystem } from "@chakra-ui/react"

const preview: Preview = {
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
