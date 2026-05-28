import { useMemo } from "react"
import { Table } from "../../../components/Table"
import { generateSelectionColumns } from "./columns"
import type { RawData } from "../../../types"

interface Props {
  data: RawData[]
  selectedRows: ReadonlySet<number>
  setSelectedRows: (rows: ReadonlySet<number>) => void
}

export const SelectHeaderTable = ({ data, selectedRows, setSelectedRows }: Props) => {
  const columns = useMemo(() => generateSelectionColumns(data), [data])
  const rowIndexMap = useMemo(() => new Map(data.map((row, i) => [row, i])), [data])

  return (
    <Table
      rowKeyGetter={(row) => rowIndexMap.get(row)!}
      rows={data}
      columns={columns}
      selectedRows={selectedRows}
      onSelectedRowsChange={(newRows) => {
        // allow selecting only one row
        const next = Array.from(newRows).find((v) => !selectedRows.has(v as number))
        if (next !== undefined) setSelectedRows(new Set([next as number]))
      }}
      onRowClick={(row) => {
        setSelectedRows(new Set([rowIndexMap.get(row)!]))
      }}
      rowHeight={36}
      headerRowHeight={0}
      className="rdg-static"
    />
  )
}
