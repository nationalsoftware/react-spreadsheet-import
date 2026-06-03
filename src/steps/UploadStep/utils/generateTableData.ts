import type { Field, Fields } from "../../../types"
import { flattenFields } from "../../../utils/flattenFields"

const titleMap: Record<Field<string>["fieldType"]["type"], string> = {
  checkbox: "Boolean",
  select: "Options",
  input: "Text",
  numeric: "Number",
  date: "Date",
}

export const generateTableData = <T extends string>(fields: Fields<T>) => {
  const flatFields = flattenFields(fields)
  const row = flatFields.reduce<Record<T, string>>(
    (acc, field) => {
      acc[field.key as T] = field.example || titleMap[field.fieldType.type]
      return acc
    },
    {} as Record<T, string>,
  )

  return flatFields.map((field) => ({
    label: field.label,
    description: field.description,
    value: row[field.key as T],
  }))
}
