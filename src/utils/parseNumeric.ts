const CURRENCY_SYMBOLS = /[$€£¥₹₽₩₿]/g
const THOUSANDS_SEPARATORS = /,/g

export type ParseNumericResult = { valid: true; value: number } | { valid: false }

export const parseNumeric = (raw: string | boolean | undefined): ParseNumericResult => {
  if (raw === undefined || raw === null || raw === "" || typeof raw === "boolean") {
    return { valid: false }
  }
  const cleaned = String(raw).trim().replace(CURRENCY_SYMBOLS, "").replace(THOUSANDS_SEPARATORS, "").trim()
  if (cleaned === "" || cleaned === "-") return { valid: false }
  const num = Number(cleaned)
  if (isNaN(num)) return { valid: false }
  return { valid: true, value: num }
}

export const formatNumeric = (value: number, decimalPlaces: number): string => value.toFixed(decimalPlaces)
