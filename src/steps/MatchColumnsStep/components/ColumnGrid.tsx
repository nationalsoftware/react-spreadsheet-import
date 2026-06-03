import type React from "react"
import type { Field, Fields } from "../../../types"
import { isFieldGroup } from "../../../types"
import type { DeepReadonly } from "ts-essentials"
import { Box, Flex, Heading, ModalBody, Text, useStyleConfig } from "@chakra-ui/react"
import { CgCheckO, CgInfo } from "react-icons/cg"
import { ContinueButton } from "../../../components/ContinueButton"
import { useRsi } from "../../../hooks/useRsi"
import type { themeOverrides } from "../../../theme"

type ColumnGridProps<T extends string> = {
  fields: Fields<T>
  unmatchedRequiredFields: string[]
  fieldRow: (field: DeepReadonly<Field<T>>) => React.ReactNode
  onContinue: () => void
  onBack?: () => void
  isLoading: boolean
}

export type Styles = (typeof themeOverrides)["components"]["MatchColumnsStep"]["baseStyle"]

export const ColumnGrid = <T extends string>({
  fields,
  unmatchedRequiredFields,
  fieldRow,
  onContinue,
  onBack,
  isLoading,
}: ColumnGridProps<T>) => {
  const { translations } = useRsi<T>()
  const styles = useStyleConfig("MatchColumnsStep") as Styles

  return (
    <>
      <ModalBody flexDir="column" p={8} overflow="auto">
        <Heading sx={styles.heading}>{translations.matchColumnsStep.title}</Heading>
        <Text sx={styles.instructions}>{translations.matchColumnsStep.instructions}</Text>
        {unmatchedRequiredFields.length > 0 ? (
          <Flex gap={2} alignItems="center">
            <Text color="orange.500">
              <CgInfo size="24px" />
            </Text>
            <Box>
              <Text display="inline">{translations.matchColumnsStep.unmatchedRequiredFields.listTitle}</Text>
              <Text display="inline" fontWeight="bold">
                {" "}
                {unmatchedRequiredFields.join(", ")}
              </Text>
            </Box>
          </Flex>
        ) : (
          <Flex gap={2} alignItems="center">
            <Text color="green.500">
              <CgCheckO size="24px" />
            </Text>
            <Text display="inline">All required fields are matched</Text>
          </Flex>
        )}
        <Flex mt={4} gap={8} alignItems="center" pb={2}>
          <Flex flex={1} alignItems="center" overflow="hidden" gap={1}>
            <Text sx={styles.title} noOfLines={1}>
              {translations.matchColumnsStep.templateTitle}
            </Text>
          </Flex>
          <Box flex={1}>
            <Text sx={styles.title}>{translations.matchColumnsStep.userTableTitle}</Text>
          </Box>
          <Box flex={1}>
            <Text sx={styles.title}>{translations.matchColumnsStep.userTableSampleTitle}</Text>
          </Box>
        </Flex>
        {fields.map((item, i) =>
          isFieldGroup(item) ? (
            <Box key={`${item.groupName}-${i}`}>
              <Flex alignItems="center" mt={4} mb={2} px={2} py={0.5} bg={item.groupColor} borderRadius="md" w="full">
                <Text fontWeight="semibold" fontSize="sm">
                  {item.groupName}
                </Text>
              </Flex>
              {item.fields.map((field) => (
                <Box key={field.key}>{fieldRow(field)}</Box>
              ))}
            </Box>
          ) : (
            <Box key={item.key}>{fieldRow(item)}</Box>
          ),
        )}
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
