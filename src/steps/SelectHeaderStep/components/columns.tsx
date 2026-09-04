import { Column, useRowSelection } from "react-data-grid"
import { RadioGroup } from "@chakra-ui/react"
import type { RawData } from "../../../types"

const SELECT_COLUMN_KEY = "select-row"
const SELECTED = "selected"

function SelectFormatter({ row }: { row: unknown }) {
  const { isRowSelected, onRowSelectionChange } = useRowSelection()

  // Chakra v3 has no standalone Radio; each row hosts a single-item radio group.
  return (
    <RadioGroup.Root
      // flex so the inline-flex item inside doesn't sit on the text baseline, leaving descender space below
      display="flex"
      alignItems="center"
      colorPalette="blue"
      value={isRowSelected ? SELECTED : null}
      onValueChange={({ value }) => {
        onRowSelectionChange({
          row,
          checked: value === SELECTED,
          isShiftClick: false,
        })
      }}
    >
      <RadioGroup.Item value={SELECTED}>
        <RadioGroup.ItemHiddenInput aria-label="Select" />
        <RadioGroup.ItemIndicator bg="white" />
      </RadioGroup.Item>
    </RadioGroup.Root>
  )
}

export const SelectColumn: Column<any, any> = {
  key: SELECT_COLUMN_KEY,
  name: "",
  width: 35,
  minWidth: 35,
  maxWidth: 35,
  resizable: false,
  sortable: false,
  frozen: true,
  cellClass: "rdg-radio",
  renderCell: ({ row }) => <SelectFormatter row={row} />,
}

export const generateSelectionColumns = (data: RawData[]) => {
  const longestRowLength = data.reduce((acc, curr) => (acc > curr.length ? acc : curr.length), 0)
  return [
    SelectColumn,
    ...Array.from(Array(longestRowLength), (_, index) => ({
      key: index.toString(),
      name: "",
      minWidth: 80,
    })),
  ]
}
