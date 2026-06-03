import { flattenFields } from "../flattenFields"
import type { Fields } from "../../types"

const inputField = { label: "Input", key: "input_field", fieldType: { type: "input" as const } }
const numericField = { label: "Amount", key: "amount", fieldType: { type: "numeric" as const } }
const checkboxField = { label: "Active", key: "active", fieldType: { type: "checkbox" as const } }

describe("flattenFields", () => {
  it("returns empty array for empty input", () => {
    expect(flattenFields([])).toEqual([])
  })

  it("returns the same fields when all are ungrouped", () => {
    const fields: Fields<string> = [inputField, numericField]
    expect(flattenFields(fields)).toEqual([inputField, numericField])
  })

  it("flattens a single group into its fields", () => {
    const fields: Fields<string> = [
      {
        groupName: "Details",
        groupColor: "blue",
        fields: [inputField, numericField],
      },
    ]
    expect(flattenFields(fields)).toEqual([inputField, numericField])
  })

  it("flattens multiple groups", () => {
    const fields: Fields<string> = [
      { groupName: "Group A", fields: [inputField] },
      { groupName: "Group B", fields: [numericField, checkboxField] },
    ]
    expect(flattenFields(fields)).toEqual([inputField, numericField, checkboxField])
  })

  it("preserves order for mixed flat and grouped entries", () => {
    const fields: Fields<string> = [inputField, { groupName: "Group", fields: [numericField, checkboxField] }]
    expect(flattenFields(fields)).toEqual([inputField, numericField, checkboxField])
  })

  it("returns only flat fields when groups have no fields", () => {
    const fields: Fields<string> = [inputField, { groupName: "Empty Group", fields: [] }]
    expect(flattenFields(fields)).toEqual([inputField])
  })
})
