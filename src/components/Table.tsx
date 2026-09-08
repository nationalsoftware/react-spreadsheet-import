import DataGrid, { DataGridProps } from "react-data-grid"
import { useRsi } from "../hooks/useRsi"

interface Props<Data> extends DataGridProps<Data> {
  rowHeight?: number
}

export const Table = <Data,>({ className, ...props }: Props<Data>) => {
  const { rtl, colorMode } = useRsi()
  // rdg-light/rdg-dark set react-data-grid's color-scheme (scrollbars, selection accents)
  return (
    <DataGrid
      className={`${colorMode === "dark" ? "rdg-dark" : "rdg-light"} ${className ?? ""}`}
      direction={rtl ? "rtl" : "ltr"}
      {...props}
    />
  )
}
