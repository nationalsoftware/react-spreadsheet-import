import { ReactSpreadsheetImport } from "../ReactSpreadsheetImport"
import { Box, Link, Code, Button, useDisclosure } from "@chakra-ui/react"
import { mockRsiValues, mock1099NECValues } from "./mockRsiValues"
import { useState } from "react"
import type { Result } from "../types"
import { RsiProps } from "../types"

export default {
  title: "React spreadsheet import",
  argTypes: {
    allowDiscard: {
      control: "boolean",
      defaultValue: true,
    },
    numberedRows: {
      control: "boolean",
      defaultValue: false,
    },
    allowInvalidSubmit: {
      control: "boolean",
      defaultValue: true,
    },
    isNavigationEnabled: {
      control: "boolean",
      defaultValue: false,
    },
    autoMapHeaders: {
      control: "boolean",
      defaultValue: true,
    },
    autoMapDistance: {
      control: "number",
      defaultValue: 2,
    },
    maxRecords: {
      control: "number",
    },
    maxFileSize: {
      control: "number",
    },
    dateFormat: {
      control: "text",
    },
    parseRaw: {
      control: "boolean",
      defaultValue: false,
    },
    rtl: {
      control: "boolean",
      defaultValue: false,
    },
    autoSelectHeaderThreshold: {
      control: { type: "range", min: 0, max: 1, step: 0.05 },
    },
  },
}

export const Basic = (args: RsiProps<string>) => {
  const [data, setData] = useState<Result<any> | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Box py={20} display="flex" gap="8px" alignItems="center">
        <Button onClick={onOpen} border="2px solid #7069FA" p="8px" borderRadius="8px">
          Open Flow
        </Button>
        (make sure you have a file to upload)
      </Box>
      <Link href="./exampleFile.csv" border="2px solid #718096" p="8px" borderRadius="8px" download="exampleCSV">
        Download example file
      </Link>
      <ReactSpreadsheetImport {...mockRsiValues} {...args} isOpen={isOpen} onClose={onClose} onSubmit={setData} />
      {!!data && (
        <Box pt={64} display="flex" gap="8px" flexDirection="column">
          <b>Returned data (showing first 100 rows):</b>
          <Code
            display="flex"
            alignItems="center"
            borderRadius="16px"
            fontSize="12px"
            background="#4A5568"
            color="white"
            p={32}
          >
            <pre>
              {JSON.stringify(
                {
                  validData: data.validData.slice(0, 100),
                  invalidData: data.invalidData.slice(0, 100),
                  all: data.all.slice(0, 100),
                },
                undefined,
                4,
              )}
            </pre>
          </Code>
        </Box>
      )}
    </>
  )
}

export const F1099NEC = (args: RsiProps<string>) => {
  const [data, setData] = useState<Result<any> | null>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <>
      <Box py={20} display="flex" gap="8px" alignItems="center">
        <Button onClick={onOpen} border="2px solid #7069FA" p="8px" borderRadius="8px">
          Open Flow
        </Button>
        (make sure you have a file to upload)
      </Box>
      <ReactSpreadsheetImport {...mock1099NECValues} {...args} isOpen={isOpen} onClose={onClose} onSubmit={setData} />
      {!!data && (
        <Box pt={64} display="flex" gap="8px" flexDirection="column">
          <b>Returned data (showing first 100 rows):</b>
          <Code
            display="flex"
            alignItems="center"
            borderRadius="16px"
            fontSize="12px"
            background="#4A5568"
            color="white"
            p={32}
          >
            <pre>
              {JSON.stringify(
                {
                  validData: data.validData.slice(0, 100),
                  invalidData: data.invalidData.slice(0, 100),
                  all: data.all.slice(0, 100),
                },
                undefined,
                4,
              )}
            </pre>
          </Code>
        </Box>
      )}
    </>
  )
}

Basic.parameters = {
  chromatic: { disableSnapshot: true },
}
