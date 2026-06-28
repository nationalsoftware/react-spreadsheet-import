import { useCallback, useState } from "react"
import { Progress, useToast } from "@chakra-ui/react"
import type XLSX from "xlsx-ugnis"
import { UploadStep } from "./UploadStep/UploadStep"
import { SelectHeaderStep } from "./SelectHeaderStep/SelectHeaderStep"
import { SelectSheetStep } from "./SelectSheetStep/SelectSheetStep"
import { mapWorkbook } from "../utils/mapWorkbook"
import { deleteSheet } from "../utils/deleteSheet"
import { ValidationStep } from "./ValidationStep/ValidationStep"
import { addErrorsAndRunHooks } from "./ValidationStep/utils/dataMutations"
import { MatchColumnsStep } from "./MatchColumnsStep/MatchColumnsStep"
import type { Columns } from "./MatchColumnsStep/MatchColumnsStep"
import { getRecordCount } from "../utils/getRecordCount"
import { useRsi } from "../hooks/useRsi"
import type { RawData } from "../types"
import { shouldAutoSelectHeader } from "./SelectHeaderStep/utils/autoSelectHeader"

export enum StepType {
  upload = "upload",
  selectSheet = "selectSheet",
  selectHeader = "selectHeader",
  matchColumns = "matchColumns",
  validateData = "validateData",
}
export type StepState =
  | {
      type: StepType.upload
    }
  | {
      type: StepType.selectSheet
      workbook: XLSX.WorkBook
    }
  | {
      type: StepType.selectHeader
      data: RawData[]
    }
  | {
      type: StepType.matchColumns
      data: RawData[]
      headerValues: RawData
    }
  | {
      type: StepType.validateData
      data: any[]
    }

interface Props {
  state: StepState
  onNext: (v: StepState) => void
  onBack?: () => void
}

export const UploadFlow = ({ state, onNext, onBack }: Props) => {
  const {
    maxRecords,
    translations,
    uploadStepHook,
    selectHeaderStepHook,
    matchColumnsStepHook,
    fields,
    rowHook,
    tableHook,
    ignoredSheetNames,
    autoSelectHeaderThreshold,
    autoMapDistance,
  } = useRsi()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [savedMatchState, setSavedMatchState] = useState<
    | {
        columns: Columns<string>
        headerValues: RawData
      }
    | undefined
  >(undefined)
  const toast = useToast()
  const errorToast = useCallback(
    (description: string) => {
      toast({
        status: "error",
        variant: "left-accent",
        position: "bottom-left",
        title: `${translations.alerts.toast.error}`,
        description,
        isClosable: true,
      })
    },
    [toast, translations],
  )

  const handleSelectHeader = useCallback(
    async (data: RawData[]) => {
      if (
        autoSelectHeaderThreshold !== undefined &&
        data.length > 0 &&
        shouldAutoSelectHeader(data[0], fields, autoMapDistance ?? 2, autoSelectHeaderThreshold)
      ) {
        try {
          const { data: hookData, headerValues } = await selectHeaderStepHook(data[0], data.slice(1))
          onNext({ type: StepType.matchColumns, data: hookData, headerValues })
        } catch (e) {
          errorToast((e as Error).message)
        }
      } else {
        onNext({ type: StepType.selectHeader, data })
      }
    },
    [autoSelectHeaderThreshold, autoMapDistance, fields, selectHeaderStepHook, onNext, errorToast],
  )

  switch (state.type) {
    case StepType.upload:
      return (
        <UploadStep
          onContinue={async (workbook, file) => {
            setUploadedFile(file)

            // Remove ignored sheets from the workbook
            ignoredSheetNames.forEach((sheetName) => deleteSheet(workbook, sheetName))

            const isSingleSheet = workbook.SheetNames.length === 1
            if (isSingleSheet) {
              const count = getRecordCount(workbook.Sheets[workbook.SheetNames[0]])
              if (maxRecords && count > maxRecords) {
                errorToast(translations.uploadStep.maxRecordsExceeded(maxRecords, count))
                return
              }
              try {
                const mappedWorkbook = await uploadStepHook(mapWorkbook(workbook))
                await handleSelectHeader(mappedWorkbook)
              } catch (e) {
                errorToast((e as Error).message)
              }
            } else {
              onNext({ type: StepType.selectSheet, workbook })
            }
          }}
        />
      )
    case StepType.selectSheet:
      return (
        <SelectSheetStep
          sheetNames={state.workbook.SheetNames}
          onContinue={async (sheetName) => {
            const count = getRecordCount(state.workbook.Sheets[sheetName])
            if (maxRecords && count > maxRecords) {
              errorToast(translations.uploadStep.maxRecordsExceeded(maxRecords, count))
              return
            }
            try {
              const mappedWorkbook = await uploadStepHook(mapWorkbook(state.workbook, sheetName))
              await handleSelectHeader(mappedWorkbook)
            } catch (e) {
              errorToast((e as Error).message)
            }
          }}
          onBack={onBack}
        />
      )
    case StepType.selectHeader:
      return (
        <SelectHeaderStep
          data={state.data}
          onContinue={async (...args) => {
            try {
              const { data, headerValues } = await selectHeaderStepHook(...args)
              onNext({
                type: StepType.matchColumns,
                data,
                headerValues,
              })
            } catch (e) {
              errorToast((e as Error).message)
            }
          }}
          onBack={onBack}
        />
      )
    case StepType.matchColumns: {
      const initialColumns =
        savedMatchState &&
        savedMatchState.headerValues.length === state.headerValues.length &&
        savedMatchState.headerValues.every((v, i) => v === state.headerValues[i])
          ? savedMatchState.columns
          : undefined
      return (
        <MatchColumnsStep
          data={state.data}
          headerValues={state.headerValues}
          initialColumns={initialColumns}
          onContinue={async (values, rawData, columns) => {
            setSavedMatchState({ columns, headerValues: state.headerValues })
            try {
              const data = await matchColumnsStepHook(values, rawData, columns)
              const dataWithMeta = await addErrorsAndRunHooks(data, fields, rowHook, tableHook)
              onNext({
                type: StepType.validateData,
                data: dataWithMeta,
              })
            } catch (e) {
              errorToast((e as Error).message)
            }
          }}
          onBack={onBack}
        />
      )
    }
    case StepType.validateData:
      return <ValidationStep initialData={state.data} file={uploadedFile!} onBack={onBack} />
    default:
      return <Progress isIndeterminate />
  }
}
