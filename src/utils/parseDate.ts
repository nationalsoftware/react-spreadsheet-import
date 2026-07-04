import { parse, format as dateFnsFormat, isValid } from "date-fns"

export type ParseDateResult = { valid: true; value: Date } | { valid: false }

const ISO_FORMAT = "yyyy-MM-dd"

// Fixed reference date (midnight) so parse doesn't inherit the current time component.
// This makes dates parsed at different moments still compare as equal when they represent the same day.
const REFERENCE_DATE = new Date(2000, 0, 1)

function tryParse(str: string, fmt: string): Date | null {
  const result = parse(str, fmt, REFERENCE_DATE)
  return isValid(result) ? result : null
}

// Collapse all common separator characters to "-" so "01/29/2001" and "01-29-2001" parse identically.
// Using "-" means normalizeSeparators(ISO_FORMAT) === ISO_FORMAT, simplifying the fallback guard below.
function normalizeSeparators(str: string): string {
  return str.replace(/[-./]/g, "-")
}

export const parseDate = (raw: string | boolean | undefined, dateFormat: string): ParseDateResult => {
  if (raw === undefined || raw === null || raw === "" || typeof raw === "boolean") {
    return { valid: false }
  }
  const str = normalizeSeparators(String(raw).trim())
  const fmt = normalizeSeparators(dateFormat)

  const fromFormat = tryParse(str, fmt)
  if (fromFormat) return { valid: true, value: fromFormat }

  // Fallback: ISO format for CSV data exported as YYYY-MM-DD
  if (fmt !== ISO_FORMAT) {
    const fromIso = tryParse(str, ISO_FORMAT)
    if (fromIso) return { valid: true, value: fromIso }
  }

  return { valid: false }
}

export const formatDate = (date: Date, dateFormat: string): string => dateFnsFormat(date, dateFormat)
