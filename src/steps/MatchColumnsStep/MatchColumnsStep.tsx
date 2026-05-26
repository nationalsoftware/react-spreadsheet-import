import { useCallback, useEffect, useMemo, useState } from "react"
import { useToast } from "@chakra-ui/react"
import { useRsi } from "../../hooks/useRsi"
import { FieldRow } from "./components/FieldRow"
import { ColumnGrid } from "./components/ColumnGrid"
import { setColumn } from "./utils/setColumn"
import { normalizeTableData } from "./utils/normalizeTableData"
import type { Field, RawData } from "../../types"
import { getMatchedColumns } from "./utils/getMatchedColumns"
import { UnmatchedFieldsAlert } from "../../components/Alerts/UnmatchedFieldsAlert"
import { findUnmatchedRequiredFields } from "./utils/findUnmatchedRequiredFields"

export type MatchColumnsProps<T extends string> = {
  data: RawData[]
  headerValues: RawData
  initialColumns?: Columns<T>
  onContinue: (data: any[], rawData: RawData[], columns: Columns<T>) => void
  onBack?: () => void
}

export enum ColumnType {
  empty,
  matched,
  matchedCheckbox,
}

type EmptyColumn = { type: ColumnType.empty; index: number; header: string }
type MatchedColumn<T> = { type: ColumnType.matched; index: number; header: string; value: T }
type MatchedSwitchColumn<T> = { type: ColumnType.matchedCheckbox; index: number; header: string; value: T }

export type Column<T extends string> = EmptyColumn | MatchedColumn<T> | MatchedSwitchColumn<T>

export type Columns<T extends string> = Column<T>[]

export const MatchColumnsStep = <T extends string>({
  data,
  headerValues,
  initialColumns,
  onContinue,
  onBack,
}: MatchColumnsProps<T>) => {
  const toast = useToast()
  const { fields, autoMapHeaders, autoMapDistance, translations } = useRsi<T>()
  const [isLoading, setIsLoading] = useState(false)
  const [columns, setColumns] = useState<Columns<T>>(
    // Do not remove spread, it indexes empty array elements, otherwise map() skips over them
    initialColumns ??
      ([...headerValues] as string[]).map((value, index) => ({ type: ColumnType.empty, index, header: value ?? "" })),
  )
  const [showUnmatchedFieldsAlert, setShowUnmatchedFieldsAlert] = useState(false)

  const firstDataRow = data[0] ?? []

  const onFieldMap = useCallback(
    (fieldKey: T, csvColumnIndex: number | null) => {
      const field = fields.find((f) => f.key === fieldKey) as unknown as Field<T>
      const previousColumnIndex = columns.findIndex((c) => "value" in c && c.value === fieldKey)

      const targetColumn = csvColumnIndex !== null ? columns[csvColumnIndex] : null
      const isDisplacingAnotherField =
        targetColumn !== null && "value" in targetColumn && targetColumn.value !== fieldKey

      if (isDisplacingAnotherField) {
        toast({
          status: "warning",
          variant: "left-accent",
          position: "bottom-left",
          title: translations.matchColumnsStep.duplicateColumnWarningTitle,
          description: translations.matchColumnsStep.duplicateColumnWarningDescription,
          isClosable: true,
        })
      }

      setColumns(
        columns.map<Column<T>>((column, index) => {
          if (csvColumnIndex !== null && index === csvColumnIndex) {
            return setColumn(column, field)
          } else if (index === previousColumnIndex) {
            return setColumn(column)
          } else {
            return column
          }
        }),
      )
    },
    [
      columns,
      fields,
      toast,
      translations.matchColumnsStep.duplicateColumnWarningDescription,
      translations.matchColumnsStep.duplicateColumnWarningTitle,
    ],
  )

  const unmatchedRequiredFields = useMemo(() => findUnmatchedRequiredFields(fields, columns), [fields, columns])

  const handleOnContinue = useCallback(async () => {
    if (unmatchedRequiredFields.length > 0) {
      setShowUnmatchedFieldsAlert(true)
    } else {
      setIsLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 0)) // show loading on Confirm
      await onContinue(normalizeTableData(columns, data, fields), data, columns)
      setIsLoading(false)
    }
  }, [unmatchedRequiredFields.length, onContinue, columns, data, fields])

  const handleAlertOnContinue = useCallback(async () => {
    setShowUnmatchedFieldsAlert(false)
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 0)) // show loading on Confirm
    await onContinue(normalizeTableData(columns, data, fields), data, columns)
    setIsLoading(false)
  }, [onContinue, columns, data, fields])

  useEffect(
    () => {
      if (autoMapHeaders && !initialColumns) {
        setColumns(getMatchedColumns(columns, fields, autoMapDistance))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  return (
    <>
      <UnmatchedFieldsAlert
        isOpen={showUnmatchedFieldsAlert}
        onClose={() => setShowUnmatchedFieldsAlert(false)}
        fields={unmatchedRequiredFields}
        onConfirm={handleAlertOnContinue}
      />
      <ColumnGrid
        fields={fields}
        unmatchedRequiredFields={unmatchedRequiredFields}
        onContinue={handleOnContinue}
        onBack={onBack}
        isLoading={isLoading}
        fieldRow={(field) => (
          <FieldRow
            field={field}
            columns={columns}
            headerValues={headerValues}
            firstDataRow={firstDataRow}
            onMap={onFieldMap}
          />
        )}
      />
    </>
  )
}
