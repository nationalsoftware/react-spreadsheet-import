import * as XLSX from "xlsx-ugnis"

export const downloadAsCsv = (
  data: Record<string, any>[],
  filename = "spreadsheet_data.csv"
) => {
  if (!data || data.length === 0) return

  // Remove internal fields
  const cleaned = data.map(({ __index, __errors, ...rest }) => rest)

  const worksheet = XLSX.utils.json_to_sheet(cleaned)
  const csv = XLSX.utils.sheet_to_csv(worksheet)

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)

  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}