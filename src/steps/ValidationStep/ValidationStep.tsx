import { useCallback, useMemo, useState } from "react"
import { Box, Button, Badge, Heading, Menu, Portal, Text } from "@chakra-ui/react"
import { FaChevronDown, FaFileCsv, FaFileExcel } from "react-icons/fa6"
import { ContinueButton } from "../../components/ContinueButton"
import { ModalBody } from "../../components/ModalParts"
import { rsiRootClassName } from "../../components/Providers"
import { useRsi } from "../../hooks/useRsi"
import { useRsiStyles } from "../../hooks/useRsiStyles"
import { useToaster } from "../../hooks/useToaster"
import type { Meta } from "./types"
import { addErrorsAndRunHooks } from "./utils/dataMutations"
import { generateColumns } from "./components/columns"
import { Table } from "../../components/Table"
import { SubmitDataAlert } from "../../components/Alerts/SubmitDataAlert"
import type { Data } from "../../types"
import type { RowsChangeData } from "react-data-grid"
import { downloadAsCsv, downloadAsXlsx } from "../../utils/downloadSpreadsheet"

const hasError = <T extends string>(row: Data<T> & Meta) =>
  !!row.__errors && Object.values(row.__errors).some((e) => e.level === "error")
const hasWarning = <T extends string>(row: Data<T> & Meta) =>
  !!row.__errors && Object.values(row.__errors).some((e) => e.level === "warning")

type Props<T extends string> = {
  initialData: (Data<T> & Meta)[]
  file: File
  onBack?: () => void
}

type Filter = "all" | "errors" | "warnings"

export const ValidationStep = <T extends string>({ initialData, file, onBack }: Props<T>) => {
  const { translations, fields, allowDiscard, numberedRows, onClose, onSubmit, rowHook, tableHook } = useRsi<T>()
  const styles = useRsiStyles("ValidationStep")
  const toaster = useToaster()

  const [data, setData] = useState<(Data<T> & Meta)[]>(initialData)

  const [selectedRows, setSelectedRows] = useState<ReadonlySet<number | string>>(new Set())
  const [filter, setFilter] = useState<Filter>("all")
  const [showSubmitAlert, setShowSubmitAlert] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)

  const updateData = useCallback(
    async (rows: typeof data, indexes?: number[], changedFieldKey?: string) => {
      setData(rows)
      addErrorsAndRunHooks<T>(rows, fields, rowHook, tableHook, indexes, changedFieldKey)
        .then((data) => setData(data))
        .catch((err: Error) => {
          toaster.create({
            type: "error",
            title: translations.alerts.toast.error,
            description: err?.message,
            closable: true,
          })
        })
    },
    [rowHook, tableHook, fields, translations, toaster],
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
      const changes = changedData?.indexes.reduce(
        (acc, index) => {
          // when data is filtered val !== actual index in data
          const realIndex = data.findIndex((value) => value.__index === rows[index].__index)
          acc[realIndex] = rows[index]
          return acc
        },
        {} as Record<number, (typeof data)[number]>,
      )
      const realIndexes = changes && Object.keys(changes).map((index) => Number(index))
      const newData = Object.assign([], data, changes)
      updateData(newData, realIndexes, changedData?.column?.key)
    },
    [data, updateData],
  )

  const columns = useMemo(
    () => generateColumns(fields, allowDiscard, numberedRows, initialData.length),
    [fields, allowDiscard, numberedRows, initialData.length],
  )

  const { errorCount, warningCount } = useMemo(() => {
    let errors = 0
    let warnings = 0
    for (const row of data) {
      if (hasError(row)) errors++
      if (hasWarning(row)) warnings++
    }
    return { errorCount: errors, warningCount: warnings }
  }, [data])

  const tableData = useMemo(() => {
    if (filter === "errors") return data.filter(hasError)
    if (filter === "warnings") return data.filter(hasWarning)
    return data
  }, [data, filter])

  const rowKeyGetter = useCallback((row: Data<T> & Meta) => row.__index, [])

  const submitData = async () => {
    const calculatedData = data.reduce(
      (acc, value) => {
        const { __index, __errors, __selectOptions: _fieldOptions, ...values } = value
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
      {
        validData: [] as Data<T>[],
        invalidData: [] as Data<T>[],
        all: data.map(({ __selectOptions: _fieldOptions, ...rest }) => rest as Data<T> & Meta),
      },
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
          toaster.create({
            type: "error",
            title: `${translations.alerts.submitError.title}`,
            description: err?.message || `${translations.alerts.submitError.defaultMessage}`,
            closable: true,
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
    const invalidData = data.find(hasError)
    if (!invalidData) {
      submitData()
    } else {
      setShowSubmitAlert(true)
    }
  }

  const filterButtonVariant = (value: Filter) => (filter === value ? "subtle" : "ghost")

  return (
    <>
      <SubmitDataAlert isOpen={showSubmitAlert} onClose={() => setShowSubmitAlert(false)} onConfirm={submitData} />
      <ModalBody pb={0}>
        <Heading css={styles.heading}>{translations.validationStep.title}</Heading>
        <Text css={styles.instructions}>{translations.validationStep.instructions}</Text>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb="2rem" flexWrap="wrap" gap="8px">
          <Box display="flex" gap="8px" alignItems="center" flexWrap="wrap">
            <Button variant={filterButtonVariant("all")} size="sm" onClick={() => setFilter("all")}>
              {translations.validationStep.allRowsCountTitle}
              {/* explicit gray: a bare v3 Badge inherits the button's rsi colorPalette and vanishes on the subtle (selected) button */}
              <Badge ml="3" colorPalette="gray">
                {data.length}
              </Badge>
            </Button>
            <Button variant={filterButtonVariant("warnings")} size="sm" onClick={() => setFilter("warnings")}>
              {translations.validationStep.warningRowsCountTitle}
              <Badge ml="3" colorPalette="orange">
                {warningCount}
              </Badge>
            </Button>
            <Button variant={filterButtonVariant("errors")} size="sm" onClick={() => setFilter("errors")}>
              {translations.validationStep.errorRowsCountTitle}
              <Badge ml="3" colorPalette="red">
                {errorCount}
              </Badge>
            </Button>
          </Box>
          <Box display="flex" gap="16px" alignItems="center" flexWrap="wrap">
            <Menu.Root
              onSelect={({ value }) => {
                if (value === "csv") downloadAsCsv(data, fields)
                if (value === "xlsx") downloadAsXlsx(data, fields)
              }}
            >
              <Menu.Trigger asChild>
                <Button variant="outline" size="sm">
                  {translations.validationStep.exportButtonTitle}
                  <FaChevronDown />
                </Button>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner className={rsiRootClassName}>
                  <Menu.Content>
                    <Menu.Item value="csv" gap={3}>
                      <FaFileCsv size="32px" color="#2B73B6" />
                      <Box>
                        <Text css={styles.exportMenuItemTitle}>{translations.validationStep.exportCsvButtonTitle}</Text>
                        <Text css={styles.exportMenuItemDescription}>
                          {translations.validationStep.exportCsvButtonDescription}
                        </Text>
                      </Box>
                    </Menu.Item>
                    <Menu.Separator />
                    <Menu.Item value="xlsx" gap={3}>
                      <FaFileExcel size="32px" color="#217346" />
                      <Box>
                        <Text css={styles.exportMenuItemTitle}>
                          {translations.validationStep.exportXlsxButtonTitle}
                        </Text>
                        <Text css={styles.exportMenuItemDescription}>
                          {translations.validationStep.exportXlsxButtonDescription}
                        </Text>
                      </Box>
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>

            {allowDiscard && (
              <Button variant="outline" size="sm" onClick={deleteSelectedRows}>
                {translations.validationStep.discardButtonTitle}
              </Button>
            )}
          </Box>
        </Box>
        <Box flex={1} minH={0} position="relative" display="flex" flexDirection="column">
          <Table
            rowKeyGetter={rowKeyGetter}
            rowHeight={36}
            rows={tableData}
            onRowsChange={updateRows}
            columns={columns}
            selectedRows={selectedRows}
            onSelectedRowsChange={(rows) => setSelectedRows(rows as ReadonlySet<string | number>)}
            onCellClick={({ selectCell }, event) => {
              selectCell(true)
              // Without this, Cell.handleClick calls selectCellWrapper() after our handler,
              // queuing mode:'SELECT' in the same React batch and overwriting mode:'EDIT'.
              event.preventGridDefault()
            }}
          />
          {tableData.length === 0 && (
            <Box
              position="absolute"
              top="35px"
              left={0}
              right={0}
              bottom={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
              pointerEvents="none"
            >
              {filter === "errors"
                ? translations.validationStep.noRowsMessageWhenFilteredByErrors
                : filter === "warnings"
                  ? translations.validationStep.noRowsMessageWhenFilteredByWarnings
                  : translations.validationStep.noRowsMessage}
            </Box>
          )}
        </Box>
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
