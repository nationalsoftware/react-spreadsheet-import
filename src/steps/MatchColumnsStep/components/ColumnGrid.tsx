import type React from "react"
import type { Column, Columns } from "../MatchColumnsStep"
import { Box, Flex, Heading, ModalBody, Text, useStyleConfig } from "@chakra-ui/react"
import { ContinueButton } from "../../../components/ContinueButton"
import { useRsi } from "../../../hooks/useRsi"
import type { themeOverrides } from "../../../theme"

type ColumnGridProps<T extends string> = {
  columns: Columns<T>
  userColumn: (column: Column<T>) => React.ReactNode
  templateColumn: (column: Column<T>) => React.ReactNode
  onContinue: (val: Record<string, string>[]) => void
  onBack?: () => void
  isLoading: boolean
}

export type Styles = (typeof themeOverrides)["components"]["MatchColumnsStep"]["baseStyle"]

export const ColumnGrid = <T extends string>({
  columns,
  userColumn,
  templateColumn,
  onContinue,
  onBack,
  isLoading,
}: ColumnGridProps<T>) => {
  const { translations } = useRsi()
  const styles = useStyleConfig("MatchColumnsStep") as Styles

  return (
    <>
      <ModalBody flexDir="column" p={8} overflow="auto">
        <Heading sx={styles.heading}>{translations.matchColumnsStep.title}</Heading>
        <Text sx={styles.instructions}>{translations.matchColumnsStep.instructions}</Text>
        <Flex mt={4} gap={10} justifyContent={"space-between"}>


          <Box flexShrink={0}>
            <Text pb={2} sx={styles.title}>{translations.matchColumnsStep.templateTitle}</Text>
            {columns.map((column, index) => (
              <Box
                key={column.header + index}
              >
                {templateColumn(column)}
              </Box>
            ))}
          </Box>

          <Box flex={1}>
            <Text pb={2} sx={styles.title}>{translations.matchColumnsStep.userTableTitle}</Text>
            {columns.map((column, index) => (
              <Box
                key={column.header + index}
              >
                {userColumn(column)}
              </Box>
            ))}
          </Box>

        </Flex>
      </ModalBody>
      <ContinueButton
        isLoading={isLoading}
        onContinue={onContinue}
        onBack={onBack}
        title={translations.matchColumnsStep.nextButtonTitle}
        backTitle={translations.matchColumnsStep.backButtonTitle}
      />
    </>
  )
}
