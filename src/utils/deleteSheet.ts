import * as XLSX from "xlsx-ugnis"

export const deleteSheet = (workbook: XLSX.WorkBook, sheetName: string): void => {
  const index = workbook.SheetNames.indexOf(sheetName);
  if (index === -1) return;

  workbook.SheetNames.splice(index, 1);
  delete workbook.Sheets[sheetName];
}
