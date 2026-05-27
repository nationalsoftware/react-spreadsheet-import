import { findMatch } from "../../MatchColumnsStep/utils/findMatch"
import type { Fields, RawData } from "../../../types"

export function shouldAutoSelectHeader<T extends string>(
  firstRow: RawData,
  fields: Fields<T>,
  autoMapDistance: number,
  threshold: number,
): boolean {
  if (fields.length === 0) return false
  const required = Math.ceil(fields.length * threshold)
  const matchedFields = new Set<T>()
  for (const cell of firstRow) {
    const match = findMatch(cell ?? "", fields, autoMapDistance)
    if (match) {
      matchedFields.add(match)
      if (matchedFields.size >= required) return true
    }
  }
  return matchedFields.size / fields.length >= threshold
}
