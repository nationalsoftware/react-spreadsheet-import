import type { Fields } from "../../../types"
import { useMemo } from "react"
import { Table } from "../../../components/Table"
import { generateColumns } from "./columns"
import { generateTableData } from "../utils/generateTableData"

interface Props<T extends string> {
  fields: Fields<T>
}

export const ExampleTable = <T extends string>({ fields }: Props<T>) => {
  const data = useMemo(() => generateTableData(fields), [fields])
  const columns = useMemo(() => generateColumns(), [fields])

  return <Table rows={data} columns={columns} className={"rdg-example"} />
}
