import type { Columns } from "../MatchColumnsStep"
import { ColumnType } from "../MatchColumnsStep"
import type { Data, Fields, RawData } from "../../../types"
import { normalizeCheckboxValue } from "./normalizeCheckboxValue"
import { parseDate, formatDate } from "../../../utils/parseDate"

export const normalizeTableData = <T extends string>(columns: Columns<T>, data: RawData[], fields: Fields<T>) =>
  data.map((row, rowIndex) => {
    return {
      __rownum: rowIndex + 2,
      ...columns.reduce((acc, column, colIndex) => {
        const curr = row[colIndex]
        switch (column.type) {
          case ColumnType.matchedCheckbox: {
            const field = fields.find((field) => field.key === column.value)!
            if ("booleanMatches" in field.fieldType && field.fieldType.booleanMatches) {
              const booleanMatchKey = Object.keys(field.fieldType.booleanMatches).find(
                (key) => key.toLowerCase() === curr?.toLowerCase(),
              )
              const booleanMatch = booleanMatchKey ? field.fieldType.booleanMatches[booleanMatchKey] : undefined
              acc[column.value] = booleanMatchKey ? booleanMatch : normalizeCheckboxValue(curr)
            } else {
              acc[column.value] = normalizeCheckboxValue(curr)
            }
            return acc
          }
          case ColumnType.matched: {
            const value = curr === "" ? undefined : curr
            if (value !== undefined) {
              const field = fields.find((f) => f.key === column.value)
              if (field?.fieldType.type === "select" && field.fieldType.options.length) {
                const selectFieldType = field.fieldType
                const options = selectFieldType.options
                const { multiSelect } = selectFieldType
                const resolveOption = (raw: string) => {
                  const lower = raw.toLowerCase()
                  return options.find(
                    (opt) =>
                      opt.value.toLowerCase() === lower ||
                      opt.label.toLowerCase() === lower ||
                      opt.alternateMatches?.some((alt) => alt.toLowerCase() === lower),
                  )
                }
                if (multiSelect) {
                  const parts = value.split(",").map((p) => p.trim())
                  acc[column.value] = parts.map((part) => resolveOption(part)?.value ?? part).join(",")
                  return acc
                }
                const matched = resolveOption(value)
                if (matched) {
                  acc[column.value] = matched.value
                  return acc
                }
              }
              if (field?.fieldType.type === "date") {
                const { dateFormat = "yyyy-MM-dd" } = field.fieldType
                const result = parseDate(value, dateFormat)
                if (result.valid) {
                  acc[column.value] = formatDate(result.value, dateFormat)
                  return acc
                }
              }
            }
            acc[column.value] = value
            return acc
          }
          case ColumnType.empty: {
            return acc
          }
          default:
            return acc
        }
      }, {} as Data<T>),
    }
  })
