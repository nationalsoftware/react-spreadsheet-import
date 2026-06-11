import ExcelJS from "exceljs"
import * as XLSX from "xlsx-ugnis"

type Fields = readonly { label: string; key: string }[]

function getKeysAndLabels(data: Record<string, any>[], fields?: Fields) {
  const labelByKey = fields ? Object.fromEntries(fields.map((f) => [f.key, f.label])) : {}
  if (fields) {
    return { keys: fields.map((f) => f.key), labelByKey }
  }
  const { __index, __rownum, __errors, __selectOptions, ...firstRest } = data[0]
  return { keys: Object.keys(firstRest), labelByKey }
}

function prepareRows(data: Record<string, any>[], keys: string[]) {
  return data.map((row) => {
    const { __index, __rownum, __errors: errors, __selectOptions, ...rowData } = row
    return { values: keys.map((k) => rowData[k]), errors }
  })
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const downloadAsCsv = (data: Record<string, any>[], fields?: Fields, filename = "export.csv") => {
  if (!data || data.length === 0) return

  const { keys, labelByKey } = getKeysAndLabels(data, fields)

  const cleaned = prepareRows(data, keys).map(({ values }) =>
    Object.fromEntries(keys.map((k, i) => [labelByKey[k] ?? k, values[i]])),
  )

  const worksheet = XLSX.utils.json_to_sheet(cleaned)
  const csv = XLSX.utils.sheet_to_csv(worksheet)

  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename)
}

export const downloadAsXlsx = async (
  data: Record<string, any>[],
  fields?: Fields,
  filename = "export.xlsx",
) => {
  if (!data || data.length === 0) return

  const { keys, labelByKey } = getKeysAndLabels(data, fields)

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet("Sheet1")

  sheet.addRow(keys.map((k) => labelByKey[k] ?? k))
  sheet.columns = keys.map(() => ({ width: 25 }))
  sheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }]

  for (const { values, errors } of prepareRows(data, keys)) {
    const excelRow = sheet.addRow(values)

    if (errors) {
      keys.forEach((key, idx) => {
        const error = errors[key]
        if (!error || (error.level !== "error" && error.level !== "warning")) return
        const cell = excelRow.getCell(idx + 1)
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: error.level === "error" ? "FFfed7d7" : "FFfeebc8" },
        }
        cell.note = error.message
      })
    }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  triggerDownload(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    filename,
  )
}
