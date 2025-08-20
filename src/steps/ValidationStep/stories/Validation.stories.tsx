import { editableTableInitialData, mockRsiValues } from "../../../stories/mockRsiValues"
import { ValidationStep } from "../ValidationStep"
import { Providers } from "../../../components/Providers"
import { defaultTheme } from "../../../ReactSpreadsheetImport"
import { ModalWrapper } from "../../../components/ModalWrapper"
import { addErrorsAndRunHooks } from "../utils/dataMutations"
import { RsiProps } from "src/types"

export default {
  title: "Validation Step",
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    allowDiscard: {
      control: "boolean",
      defaultValue: true,
    },
    numberedRows: {
      control: "boolean",
      defaultValue: true,
    },
  },
}

const file = new File([""], "file.csv")
const data = await addErrorsAndRunHooks(editableTableInitialData, mockRsiValues.fields)

export const Basic = (args: RsiProps<string>) => {
  return (
    <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, ...args }}>
      <ModalWrapper isOpen={true} onClose={() => {}}>
        <ValidationStep initialData={data} file={file} />
      </ModalWrapper>
    </Providers>
  )
}
