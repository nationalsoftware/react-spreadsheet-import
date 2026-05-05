import { useCallback, useMemo, useState } from "react"
import { Box, Button, Badge, Heading, ModalBody, Text, useStyleConfig, useToast } from "@chakra-ui/react"
import { ContinueButton } from "../../components/ContinueButton"
import { useRsi } from "../../hooks/useRsi"
import type { Meta } from "./types"
import { addErrorsAndRunHooks } from "./utils/dataMutations"
import { generateColumns } from "./components/columns"
import { Table } from "../../components/Table"
import { SubmitDataAlert } from "../../components/Alerts/SubmitDataAlert"
import type { Data } from "../../types"
import type { themeOverrides } from "../../theme"
import type { RowsChangeData } from "react-data-grid"
import { downloadAsCsv } from "../../utils/downloadAsCsv"

type Props<T extends string> = {
  initialData: (Data<T> & Meta)[]
  file: File
  onBack?: () => void
}

export const ValidationStep = <T extends string>({ initialData, file, onBack }: Props<T>) => {
  const { translations, fields, allowDiscard, numberedRows, onClose, onSubmit, rowHook, tableHook } = useRsi<T>()
  const styles = useStyleConfig(
    "ValidationStep",
  ) as (typeof themeOverrides)["components"]["ValidationStep"]["baseStyle"]
  const toast = useToast()

  const [data, setData] = useState<(Data<T> & Meta)[]>(initialData)

  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number | string>>(new Set())
  const [filter, setFilter] = useState<"all" | "errors" | "warnings">("all")
  const [showSubmitAlert, setShowSubmitAlert] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)

  const updateData = useCallback(
    async (rows: typeof data, indexes?: number[]) => {
      // Check if hooks are async - if they are we want to apply changes optimistically for better UX
      if (rowHook?.constructor.name === "AsyncFunction" || tableHook?.constructor.name === "AsyncFunction") {
        setData(rows)
      }
      addErrorsAndRunHooks<T>(rows, fields, rowHook, tableHook, indexes).then((data) => setData(data))
    },
    [rowHook, tableHook, fields],
  )

  const deleteSelectedRows = () => {
    if (selectedRows.size) {
      const newData = data.filter((value) => !selectedRows.has(value.__index))
      updateData(newData)
      setSelectedRows(new Set())
    }
  }

  const updateRows = useCallback(
    (rows: typeof data, changedData?: RowsChangeData<(typeof data)[number]>) => {
      const changes = changedData?.indexes.reduce((acc, index) => {
        // when data is filtered val !== actual index in data
        const realIndex = data.findIndex((value) => value.__index === rows[index].__index)
        acc[realIndex] = rows[index]
        return acc
      }, {} as Record<number, (typeof data)[number]>)
      const realIndexes = changes && Object.keys(changes).map((index) => Number(index))
      const newData = Object.assign([], data, changes)
      updateData(newData, realIndexes)
    },
    [data, updateData],
  )

  const columns = useMemo(() => generateColumns(
    fields, allowDiscard, numberedRows),
    [fields, allowDiscard, numberedRows]
  )

  const errorCount = useMemo(
    () => data.filter((row) => row?.__errors && Object.values(row.__errors).some((e) => e.level === "error")).length,
    [data],
  )

  const warningCount = useMemo(
    () => data.filter((row) => row?.__errors && Object.values(row.__errors).some((e) => e.level === "warning")).length,
    [data],
  )

  const tableData = useMemo(() => {
    if (filter === "errors") {
      return data.filter((value) => value?.__errors && Object.values(value.__errors).some((e) => e.level === "error"))
    }
    if (filter === "warnings") {
      return data.filter((value) => value?.__errors && Object.values(value.__errors).some((e) => e.level === "warning"))
    }
    return data
  }, [data, filter])

  const rowKeyGetter = useCallback((row: Data<T> & Meta) => row.__index, [])

  const submitData = async () => {
    const calculatedData = data.reduce(
      (acc, value) => {
        const { __index, __errors, ...values } = value
        if (__errors) {
          for (const key in __errors) {
            if (__errors[key].level === "error") {
              acc.invalidData.push(values as unknown as Data<T>)
              return acc
            }
          }
        }
        acc.validData.push(values as unknown as Data<T>)
        return acc
      },
      { validData: [] as Data<T>[], invalidData: [] as Data<T>[], all: data },
    )
    setShowSubmitAlert(false)
    setSubmitting(true)
    const response = onSubmit(calculatedData, file)
    if (response?.then) {
      response
        .then(() => {
          onClose()
        })
        .catch((err: Error) => {
          toast({
            status: "error",
            variant: "left-accent",
            position: "bottom-left",
            title: `${translations.alerts.submitError.title}`,
            description: err?.message || `${translations.alerts.submitError.defaultMessage}`,
            isClosable: true,
          })
        })
        .finally(() => {
          setSubmitting(false)
        })
    } else {
      onClose()
    }
  }
  const onContinue = () => {
    const invalidData = data.find((value) => {
      if (value?.__errors) {
        return !!Object.values(value.__errors)?.filter((err) => err.level === "error").length
      }
      return false
    })
    if (!invalidData) {
      submitData()
    } else {
      setShowSubmitAlert(true)
    }
  }

  return (
    <>
      <SubmitDataAlert isOpen={showSubmitAlert} onClose={() => setShowSubmitAlert(false)} onConfirm={submitData} />
      <ModalBody pb={0}>
        <Heading sx={styles.heading}>{translations.validationStep.title}</Heading>
        <Text sx={styles.instructions}>{translations.validationStep.instructions}</Text>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="2rem" flexWrap="wrap" gap="8px">
          <Box display="flex" gap="8px" alignItems="center" flexWrap="wrap">
            <Button variant="ghost" size="sm" isActive={filter === "all"} onClick={() => setFilter("all")}>
              {translations.validationStep.allRowsCountTitle}
              <Badge ml="3">
                {data.length}
              </Badge>
            </Button>
            <Button variant="ghost" size="sm" isActive={filter === "warnings"} onClick={() => setFilter("warnings")}>
              {translations.validationStep.warningRowsCountTitle}
              <Badge ml="3" colorScheme="orange">
                {warningCount}
              </Badge>
            </Button>
            <Button variant="ghost" size="sm" isActive={filter === "errors"} onClick={() => setFilter("errors")}>
              {translations.validationStep.errorRowsCountTitle}
              <Badge ml="3" colorScheme="red">
                {errorCount}
              </Badge>
            </Button>
          </Box>
          <Box display="flex" gap="16px" alignItems="center" flexWrap="wrap">
            <Button variant="outline" size="sm" onClick={() => downloadAsCsv(data)}>
              {translations.validationStep.exportButtonTitle}
            </Button>
            {allowDiscard && (
              <Button variant="outline" size="sm" onClick={deleteSelectedRows}>
                {translations.validationStep.discardButtonTitle}
              </Button>
            )}
          </Box>
        </Box>
        <Table
          rowKeyGetter={rowKeyGetter}
          rows={tableData}
          onRowsChange={updateRows}
          columns={columns}
          selectedRows={selectedRows}
          onSelectedRowsChange={setSelectedRows}
          components={{
            noRowsFallback: (
              <Box display="flex" justifyContent="center" gridColumn="1/-1" mt="32px">
                {filter === "errors"
                  ? translations.validationStep.noRowsMessageWhenFilteredByErrors
                  : filter === "warnings"
                    ? translations.validationStep.noRowsMessageWhenFilteredByWarnings
                    : translations.validationStep.noRowsMessage}
              </Box>
            ),
          }}
        />
      </ModalBody>
      <ContinueButton
        isLoading={isSubmitting}
        onContinue={onContinue}
        onBack={onBack}
        title={translations.validationStep.nextButtonTitle}
        backTitle={translations.validationStep.backButtonTitle}
      />
    </>
  )
}
