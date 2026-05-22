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
// Cast needed: TypeScript infers T=string here, making Data<T> an index signature that
// rejects __rownum: number. At runtime the shape is correct.
const data = await addErrorsAndRunHooks(
  editableTableInitialData as unknown as Parameters<typeof addErrorsAndRunHooks>[0],
  mockRsiValues.fields,
)

export const Basic = (args: RsiProps<string>) => {
  return (
    <Providers theme={defaultTheme} rsiValues={{ ...mockRsiValues, ...args }}>
      <ModalWrapper isOpen={true} onClose={() => {}}>
        <ValidationStep initialData={data} file={file} />
      </ModalWrapper>
    </Providers>
  )
}
