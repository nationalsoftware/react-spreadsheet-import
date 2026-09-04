import type XLSX from "xlsx-ugnis"
import { Box, Flex, Heading, Text } from "@chakra-ui/react"
import { DropZone } from "./components/DropZone"
import { useRsi } from "../../hooks/useRsi"
import { useRsiStyles } from "../../hooks/useRsiStyles"
import { ExampleTable } from "./components/ExampleTable"
import { ModalBody } from "../../components/ModalParts"
import { useCallback, useState } from "react"

type UploadProps = {
  onContinue: (data: XLSX.WorkBook, file: File) => Promise<void>
}

export const UploadStep = ({ onContinue }: UploadProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const styles = useRsiStyles("UploadStep")
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
      <Heading css={styles.heading}>{translations.uploadStep.title}</Heading>
      <Text css={styles.instructions}>{translations.uploadStep.instructions}</Text>
      <Text css={styles.title}>{translations.uploadStep.manifestTitle}</Text>
      {/* Flex rather than HStack: HStack's own alignItems style prop would override the theme's css */}
      <Flex css={styles.contentWrapper}>
        <Box css={styles.tableWrapper}>
          <ExampleTable fields={fields} />
        </Box>
        <Box css={styles.dropzoneWrapper}>
          <DropZone onContinue={handleOnContinue} isLoading={isLoading} />
        </Box>
      </Flex>
    </ModalBody>
  )
}
