import type XLSX from "xlsx-ugnis"

export const getRecordCount = (workSheet: XLSX.WorkSheet): number => {
  const [top, bottom] = workSheet["!ref"]?.split(":").map((position) => parseInt(position.replace(/\D/g, ""), 10)) || [
    0, 0,
  ]
  return bottom - top
}
