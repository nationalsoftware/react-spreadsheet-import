import type XLSX from "xlsx-ugnis"
import { Box, Heading, ModalBody, Text, HStack, useStyleConfig } from "@chakra-ui/react"
import { DropZone } from "./components/DropZone"
import { useRsi } from "../../hooks/useRsi"
import { ExampleTable } from "./components/ExampleTable"
import { useCallback, useState } from "react"
import type { themeOverrides } from "../../theme"

type UploadProps = {
  onContinue: (data: XLSX.WorkBook, file: File) => Promise<void>
}

export const UploadStep = ({ onContinue }: UploadProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const styles = useStyleConfig("UploadStep") as (typeof themeOverrides)["components"]["UploadStep"]["baseStyle"]
  const { translations, fields } = useRsi()
  const handleOnContinue = useCallback(
    async (data: XLSX.WorkBook, file: File) => {
      setIsLoading(true)
      await onContinue(data, file)
      setIsLoading(false)
    },
    [onContinue],
  )
  return (
    <ModalBody>
      <Heading sx={styles.heading}>{translations.uploadStep.title}</Heading>
      <Text sx={styles.instructions}>{translations.uploadStep.instructions}</Text>
      <Text sx={styles.title}>{translations.uploadStep.manifestTitle}</Text>
      <HStack sx={styles.contentWrapper}>
        <Box sx={styles.tableWrapper}>
          <ExampleTable fields={fields} />
        </Box>
        <Box sx={styles.dropzoneWrapper}>
          <DropZone onContinue={handleOnContinue} isLoading={isLoading} />
        </Box>
      </HStack>
    </ModalBody>
  )
}
