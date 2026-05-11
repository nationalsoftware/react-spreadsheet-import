import type { Field } from "../../../types"
import { Column, ColumnType } from "../MatchColumnsStep"

export const setColumn = <T extends string>(oldColumn: Column<T>, field?: Field<T>): Column<T> => {
  switch (field?.fieldType.type) {
    case "select":
    case "input":
    case "numeric":
      return { index: oldColumn.index, type: ColumnType.matched, value: field.key, header: oldColumn.header }
    case "checkbox":
      return { index: oldColumn.index, type: ColumnType.matchedCheckbox, value: field.key, header: oldColumn.header }
    default:
      return { index: oldColumn.index, header: oldColumn.header, type: ColumnType.empty }
  }
}
