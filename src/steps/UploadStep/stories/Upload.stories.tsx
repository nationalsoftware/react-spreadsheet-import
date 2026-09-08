import type { StoryContext } from "@storybook/react"
import { UploadStep } from "../UploadStep"
import { defaultTheme } from "../../../ReactSpreadsheetImport"
import { mockRsiValues } from "../../../stories/mockRsiValues"
import { Providers } from "../../../components/Providers"
import { ModalWrapper } from "../../../components/ModalWrapper"

export default {
  title: "Upload Step",
  parameters: {
    layout: "fullscreen",
  },
}

export const Basic = (_args: unknown, { globals }: StoryContext) => {
  return (
    <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, colorMode: globals.colorMode }}>
      <ModalWrapper isOpen={true} onClose={() => {}}>
        <UploadStep onContinue={async () => {}} />
      </ModalWrapper>
    </Providers>
  )
}
