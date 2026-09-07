import { Box, Button, Spinner, Text } from "@chakra-ui/react"
import { useDropzone } from "react-dropzone"
import * as XLSX from "xlsx-ugnis"
import { useState } from "react"
import { getDropZoneBorder } from "../utils/getDropZoneBorder"
import { useRsi } from "../../../hooks/useRsi"
import { useRsiStyles } from "../../../hooks/useRsiStyles"
import { useToaster } from "../../../hooks/useToaster"
import { readFileAsync } from "../utils/readFilesAsync"

type DropZoneProps = {
  onContinue: (data: XLSX.WorkBook, file: File) => void
  isLoading: boolean
}

export const DropZone = ({ onContinue, isLoading }: DropZoneProps) => {
  const { translations, maxFileSize, dateFormat, parseRaw } = useRsi()
  const styles = useRsiStyles("UploadStep")
  const toaster = useToaster()
  const [loading, setLoading] = useState(false)
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    maxFiles: 1,
    maxSize: maxFileSize,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "text/csv": [".csv"],
    },
    onDropRejected: (fileRejections) => {
      setLoading(false)
      fileRejections.forEach((fileRejection) => {
        toaster.create({
          type: "error",
          title: `${fileRejection.file.name} ${translations.uploadStep.dropzone.errorToastDescription}`,
          description: fileRejection.errors[0].message,
          closable: true,
        })
      })
    },
    onDropAccepted: async ([file]) => {
      setLoading(true)
      const arrayBuffer = await readFileAsync(file)
      const workbook = XLSX.read(arrayBuffer, {
        cellDates: true,
        dateNF: dateFormat,
        raw: parseRaw,
        dense: true,
        codepage: 65001,
      })
      setLoading(false)
      onContinue(workbook, file)
    },
  })

  return (
    <Box
      {...getRootProps()}
      css={getDropZoneBorder(styles.dropZoneBorder)}
      width="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      flex={1}
    >
      <input {...getInputProps()} data-testid="rsi-dropzone" />
      {isDragActive ? (
        <Text css={styles.dropzoneText}>{translations.uploadStep.dropzone.activeDropzoneTitle}</Text>
      ) : loading || isLoading ? (
        <>
          <Spinner />
          <Text css={styles.dropzoneText}>{translations.uploadStep.dropzone.loadingTitle}</Text>
        </>
      ) : (
        <>
          <Text css={styles.dropzoneText}>{translations.uploadStep.dropzone.title}</Text>
          <Button css={styles.dropzoneButton} onClick={open}>
            {translations.uploadStep.dropzone.buttonTitle}
          </Button>
        </>
      )}
    </Box>
  )
}
