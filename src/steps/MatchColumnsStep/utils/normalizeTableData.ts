import type { Columns } from "../MatchColumnsStep"
import { ColumnType } from "../MatchColumnsStep"
import type { Data, Fields, RawData } from "../../../types"
import { normalizeCheckboxValue } from "./normalizeCheckboxValue"

export const normalizeTableData = <T extends string>(columns: Columns<T>, data: RawData[], fields: Fields<T>) =>
  data.map((row, rowIndex) => {
    return {
      __rownum: rowIndex + 2,
      ...columns.reduce((acc, column, colIndex) => {
        const curr = row[colIndex]
        switch (column.type) {
          case ColumnType.matchedCheckbox: {
            const field = fields.find((field) => field.key === column.value)!
            if ("booleanMatches" in field.fieldType && Object.keys(field.fieldType).length) {
              const booleanMatchKey = Object.keys(field.fieldType.booleanMatches || []).find(
                (key) => key.toLowerCase() === curr?.toLowerCase(),
              )!
              const booleanMatch = field.fieldType.booleanMatches?.[booleanMatchKey]
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
              if (field?.fieldType.type === "select") {
                const selectFieldType = field.fieldType
                const resolveOption = (raw: string) => {
                  const lower = raw.toLowerCase()
                  return selectFieldType.options.find(
                    (opt) =>
                      opt.value.toLowerCase() === lower ||
                      opt.label.toLowerCase() === lower ||
                      opt.alternateMatches?.some((alt) => alt.toLowerCase() === lower),
                  )
                }
                if (field.fieldType.multiSelect) {
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
