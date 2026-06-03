import { findMatch } from "../../MatchColumnsStep/utils/findMatch"
import type { Fields, RawData } from "../../../types"
import { flattenFields } from "../../../utils/flattenFields"

export function shouldAutoSelectHeader<T extends string>(
  firstRow: RawData,
  fields: Fields<T>,
  autoMapDistance: number,
  threshold: number,
): boolean {
  const flatFields = flattenFields(fields)
  if (flatFields.length === 0) return false
  const required = Math.ceil(flatFields.length * threshold)
  const matchedFields = new Set<T>()
  for (const cell of firstRow) {
    const match = findMatch<T>(cell ?? "", flatFields, autoMapDistance)
    if (match) {
      matchedFields.add(match)
      if (matchedFields.size >= required) return true
    }
  }
  return matchedFields.size / flatFields.length >= threshold
}
