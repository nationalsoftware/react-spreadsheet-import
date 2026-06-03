import { Column, ColumnOrColumnGroup, useRowSelection } from "react-data-grid"
import {
  Box,
  Checkbox,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Switch,
  Tooltip,
} from "@chakra-ui/react"
import type { Data, Field, Fields, SelectOption } from "../../../types"
import { isFieldGroup } from "../../../types"
import type { DeepReadonly } from "ts-essentials"
import { useEffect, useRef, type ChangeEvent } from "react"
import type { Meta } from "../types"
import { CgInfo } from "react-icons/cg"
import { TableSelect } from "../../../components/Selects/TableSelect"
import { TableMultiSelect } from "../../../components/Selects/TableMultiSelect"

// Resolves a Chakra UI design token (e.g. "rsi.500", "red.400") to the
// corresponding CSS custom property so it can be applied via direct DOM
// style mutation. Raw CSS values (#hex, rgb, hsl, var()) pass through unchanged.
const chakraToCssColor = (color: string): string =>
  color.startsWith("#") || color.startsWith("rgb") || color.startsWith("hsl") || color.startsWith("var(")
    ? color
    : `var(--chakra-colors-${color.replace(/\./g, "-")})`

// Renders a group header name that stays pinned at the left edge of its spanning
// cell as the user scrolls right — mirroring ag-Grid's group header behaviour.
//
// The trick: react-data-grid cells have overflow:hidden, which also creates a
// scroll container and traps position:sticky inside the cell. Changing the cell
// to overflow:clip preserves the visual clipping but does NOT create a scroll
// container, so position:sticky on the inner span resolves against the grid
// viewport. The cell's clip boundary then acts as the natural right-side cutoff:
// once the cell's right edge scrolls past the frozen area, the text disappears.
function StickyGroupName({ name, color, frozenOffset }: { name: string; color?: string; frozenOffset: number }) {
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const span = spanRef.current
    const cell = span?.closest('[role="columnheader"]') as HTMLElement | null
    if (!cell || !span) return
    cell.style.overflow = "clip"
    if (color) cell.style.backgroundColor = chakraToCssColor(color)
    // Preserve the cell's left padding so the text doesn't sit flush against the
    // border once it becomes sticky.
    const paddingLeft = parseFloat(getComputedStyle(cell).paddingLeft) || 0
    span.style.left = `${frozenOffset + paddingLeft}px`
  }, [frozenOffset, color])

  return (
    <span
      ref={spanRef}
      style={{ display: "inline-flex", alignItems: "center", position: "sticky", left: frozenOffset }}
    >
      {name}
    </span>
  )
}

const SELECT_COLUMN_KEY = "select-row"

function autoFocusAndSelect(input: HTMLInputElement | null) {
  input?.focus()
  input?.select()
}

function DiscardRowCheckbox({ row }: { row: unknown }) {
  const { isRowSelected, onRowSelectionChange } = useRowSelection()
  return (
    <Checkbox
      bg="white"
      aria-label="Select"
      isChecked={isRowSelected}
      onChange={(event) => {
        onRowSelectionChange({
          row,
          checked: Boolean(event.target.checked),
          isShiftClick: (event.nativeEvent as MouseEvent).shiftKey,
        })
      }}
    />
  )
}

export const generateColumns = <T extends string>(
  fields: Fields<T>,
  allowDiscard = true,
  numberedRows = false,
  rowCount = 0,
): ColumnOrColumnGroup<Data<T> & Meta>[] => {
  const columns: ColumnOrColumnGroup<Data<T> & Meta>[] = []
  let frozenColumnsWidth = 0

  // discard row checkbox
  if (allowDiscard) {
    const discardWidth = 35
    frozenColumnsWidth += discardWidth
    columns.push({
      key: SELECT_COLUMN_KEY,
      name: "",
      width: discardWidth,
      minWidth: discardWidth,
      maxWidth: discardWidth,
      resizable: false,
      sortable: false,
      frozen: true,
      cellClass: "rdg-checkbox",
      renderCell: ({ row }) => <DiscardRowCheckbox row={row} />,
    })
  }

  // row number
  if (numberedRows) {
    const maxRowNum = rowCount + 1 // __rownum starts at 2 (row 1 is the header)
    const numDigits = maxRowNum > 0 ? String(maxRowNum).length : 1
    const rowNumWidth = Math.max(40, numDigits * 10 + 14)
    frozenColumnsWidth += rowNumWidth
    columns.push({
      key: "__rownum",
      name: "",
      width: rowNumWidth,
      minWidth: rowNumWidth,
      maxWidth: rowNumWidth,
      resizable: false,
      sortable: false,
      frozen: true,
      cellClass: "rdg-cell-rownum",
    })
  }

  const buildFieldColumn = (column: DeepReadonly<Field<T>>): Column<Data<T> & Meta> => {
    const resolveOptions = (row: Data<T> & Meta): SelectOption[] =>
      (row.__selectOptions?.[column.key] ??
        (column.fieldType.type === "select" ? column.fieldType.options : undefined) ??
        []) as SelectOption[]
    return {
      key: column.key,
      name: column.label,
      minWidth: 150,
      resizable: true,
      renderHeaderCell: () => (
        <Box display="flex" gap={1} alignItems="center" position="relative">
          <Tooltip
            placement="top"
            label={column.label}
            bg="gray.100"
            color="gray.700"
            fontSize="xs"
            fontWeight="medium"
            px={2}
            py={1}
            borderRadius="md"
          >
            <Box /* flex={1} */ overflow="hidden" textOverflow="ellipsis">
              {column.label}
            </Box>
          </Tooltip>
          {column.description && (
            <Tooltip placement="top" hasArrow label={column.description} whiteSpace="pre-line">
              <Box /* flex={"0 0 auto"} */>
                <CgInfo size="16px" />
              </Box>
            </Tooltip>
          )}
        </Box>
      ),
      editable: column.fieldType.type !== "checkbox",
      renderEditCell: ({ row, onRowChange, onClose }) => {
        let component

        switch (column.fieldType.type) {
          case "date": {
            const dateFormat = column.fieldType.dateFormat ?? "yyyy-MM-dd"
            component = (
              <Input
                ref={autoFocusAndSelect}
                variant="unstyled"
                autoFocus
                size="sm"
                height="100%"
                width="100%"
                placeholder={dateFormat.toUpperCase()}
                value={(row[column.key as T] as string) ?? ""}
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  onRowChange({ ...row, [column.key]: event.target.value || undefined })
                }}
                onBlur={() => onClose(true)}
                paddingLeft="0.5rem"
                paddingRight="0.5rem"
              />
            )
            break
          }
          case "select": {
            const rawValue = row[column.key as T] as string
            const fieldType = column.fieldType
            const options = resolveOptions(row)
            if (options.length > 0) {
              if (fieldType.multiSelect) {
                const selectedValues = rawValue ? rawValue.split(",") : []
                const selectedOptions = selectedValues.map(
                  (v) => options.find((o) => o.value === v) ?? { label: v, value: v },
                )
                component = (
                  <TableMultiSelect
                    value={selectedOptions}
                    onChange={(values) => {
                      onRowChange({ ...row, [column.key]: values.map((v) => v.value).join(",") }, false)
                    }}
                    options={options}
                  />
                )
              } else {
                const matchedOption = options.find((option) => option.value === rawValue)
                component = (
                  <TableSelect
                    value={matchedOption ?? (rawValue ? { label: rawValue, value: rawValue } : undefined)}
                    onChange={(value) => {
                      onRowChange({ ...row, [column.key]: value?.value }, true)
                    }}
                    options={options}
                  />
                )
              }
              return component
            }
            // empty options (setSelectOptions override) — fall through to plain text input
          }
          // falls through
          default:
            component = (
              <InputGroup size="sm" height="100%">
                {column.columnStyle?.prefix && (
                  <InputLeftElement pointerEvents="none" color="gray.500" height="100%">
                    {column.columnStyle.prefix}
                  </InputLeftElement>
                )}
                <Input
                  ref={autoFocusAndSelect}
                  variant="unstyled"
                  autoFocus
                  value={(row[column.key as T] as string) ?? ""}
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    onRowChange({ ...row, [column.key]: event.target.value })
                  }}
                  onBlur={() => onClose(true)}
                  textAlign={column.columnStyle?.textAlign}
                  paddingLeft={column.columnStyle?.prefix ? "2rem" : "0.5rem"}
                  paddingRight={column.columnStyle?.suffix ? "2rem" : "0.5rem"}
                />
                {column.columnStyle?.suffix && (
                  <InputRightElement pointerEvents="none" color="gray.500" height="100%">
                    {column.columnStyle.suffix}
                  </InputRightElement>
                )}
              </InputGroup>
            )
        }

        return component
      },
      renderCell: ({ row, onRowChange }) => {
        let component

        const getDisplayValue = (value: string | boolean | undefined) => {
          if (column.fieldType.type !== "numeric" || !value) return value
          const num = Number(value)
          return isNaN(num)
            ? value
            : num.toLocaleString("en-US", {
                minimumFractionDigits: column.fieldType.decimalPlaces ?? 0,
                maximumFractionDigits: column.fieldType.decimalPlaces ?? 0,
                useGrouping: column.fieldType.thousandsSeparator ?? true,
              })
        }

        switch (column.fieldType.type) {
          case "checkbox":
            component = (
              <Box
                display="flex"
                alignItems="center"
                height="100%"
                onClick={(event) => {
                  event.stopPropagation()
                }}
              >
                <Switch
                  isChecked={row[column.key as T] as boolean}
                  onChange={() => {
                    onRowChange({ ...row, [column.key]: !row[column.key as T] })
                  }}
                />
              </Box>
            )
            break
          case "date": {
            component = (
              <Box minWidth="100%" minHeight="100%" overflow="hidden" display="flex" alignItems="center">
                <Box flex={1} overflow="hidden" textOverflow="ellipsis" textAlign={column.columnStyle?.textAlign}>
                  {(row[column.key as T] as string | undefined) ?? null}
                </Box>
              </Box>
            )
            break
          }
          case "select": {
            const fieldType = column.fieldType
            const rawValue = row[column.key as T] as string
            const options = resolveOptions(row)
            if (options.length > 0) {
              component = fieldType.multiSelect ? (
                <Box minWidth="100%" minHeight="100%" overflow="hidden" display="flex" alignItems="center">
                  <Box flex={1} overflow="hidden" textOverflow="ellipsis">
                    {rawValue
                      ? rawValue
                          .split(",")
                          .map((v) => options.find((o) => o.value === v)?.label ?? v)
                          .join(", ")
                      : null}
                  </Box>
                </Box>
              ) : (
                <Box minWidth="100%" minHeight="100%" overflow="hidden" display="flex" alignItems="center">
                  <Box flex={1} overflow="hidden" textOverflow="ellipsis">
                    {options.find((option) => option.value === rawValue)?.label || rawValue || null}
                  </Box>
                </Box>
              )
              break
            }
            // empty options (setSelectOptions override) — fall through to plain text display
          }
          // falls through
          case "numeric":
          default: {
            const cellValue = row[column.key as T]
            component = (
              <Box minWidth="100%" minHeight="100%" overflow="hidden" display="flex" alignItems="center">
                {column.columnStyle?.prefix && cellValue && (
                  <Box as="span" color="gray.500" flexShrink={0} mr={1}>
                    {column.columnStyle.prefix}
                  </Box>
                )}
                <Box flex={1} overflow="hidden" textOverflow="ellipsis" textAlign={column.columnStyle?.textAlign}>
                  {getDisplayValue(cellValue)}
                </Box>
                {column.columnStyle?.suffix && cellValue && (
                  <Box as="span" color="gray.500" flexShrink={0} ml={1}>
                    {column.columnStyle.suffix}
                  </Box>
                )}
              </Box>
            )
          }
        }

        if (row.__errors?.[column.key]) {
          return (
            <Tooltip
              placement="top"
              hasArrow
              label={row.__errors?.[column.key]?.message}
              closeDelay={20}
              whiteSpace="pre-line"
            >
              {component}
            </Tooltip>
          )
        }

        return component
      },
      cellClass: (row: Meta) => {
        const classes: string[] = []
        if (column.fieldType.type === "numeric") classes.push("rdg-cell-numeric")
        const errorLevel = row.__errors?.[column.key]?.level
        if (errorLevel) classes.push(`rdg-cell-${errorLevel}`)
        return classes.join(" ")
      },
    }
  }

  // frozenColumnsWidth was accumulated above as each frozen column was pushed.
  // It is used by StickyGroupName as the left offset at which the group text pins.
  for (const item of fields) {
    if (isFieldGroup(item)) {
      columns.push({
        name: <StickyGroupName name={item.groupName} color={item.groupColor} frozenOffset={frozenColumnsWidth} />,
        children: item.fields.map(buildFieldColumn),
      })
    } else {
      columns.push(buildFieldColumn(item))
    }
  }

  return columns
}
