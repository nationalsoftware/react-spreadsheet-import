import { Box, Flex, Text, useStyleConfig } from "@chakra-ui/react"
import { useRsi } from "../../../hooks/useRsi"
import type { Column, Columns } from "../MatchColumnsStep"
import { ColumnType } from "../MatchColumnsStep"
import { MatchIcon } from "./MatchIcon"
import { MatchColumnSelect } from "../../../components/Selects/MatchColumnSelect"
import type { Styles } from "./ColumnGrid"
import type { Fields, RawData } from "../../../types"

type FieldRowProps<T extends string> = {
  field: Fields<T>[number]
  columns: Columns<T>
  headerValues: RawData
  firstDataRow: RawData
  onMap: (fieldKey: T, csvColumnIndex: number | null) => void
}

export const FieldRow = <T extends string>({ field, columns, headerValues, firstDataRow, onMap }: FieldRowProps<T>) => {
  const { translations } = useRsi<T>()
  const styles = useStyleConfig("MatchColumnsStep") as Styles

  const matchedColumn = columns.find(
    (c): c is Extract<Column<T>, { value: T }> => "value" in c && c.value === field.key,
  )

  const isMatched =
    matchedColumn !== undefined &&
    (matchedColumn.type === ColumnType.matched || matchedColumn.type === ColumnType.matchedCheckbox)

  const isRequired = field.validations?.some((v) => v.rule === "required") ?? false

  const csvOptions = ([...headerValues] as string[]).map((header, index) => ({
    value: String(index),
    label: header ?? `Column ${index + 1}`,
  }))

  const selectedOption = matchedColumn ? csvOptions.find((opt) => opt.value === String(matchedColumn.index)) : undefined

  const matchedOption = new Set(
    columns
      .filter((c): c is Extract<Column<T>, { value: T }> => "value" in c && c.value !== field.key)
      .map((c) => c.index),
  )

  const groupedOptions = [
    {
      label: translations.matchColumnsStep.unmatchedGroupLabel,
      options: csvOptions.filter((opt) => !matchedOption.has(Number(opt.value))),
    },
    {
      label: translations.matchColumnsStep.matchedGroupLabel,
      options: csvOptions.filter((opt) => matchedOption.has(Number(opt.value))),
    },
  ].filter((g) => g.options.length > 0)

  const sampleValue = matchedColumn !== undefined ? firstDataRow[matchedColumn.index] : undefined

  return (
    <Flex minH={14} w="100%" alignItems="center">
      <Flex flex={1} alignItems="center" overflow="hidden" gap={1}>
        <MatchIcon isChecked={isMatched} />
        <Text sx={styles.userTable.header} noOfLines={1} flex={1}>
          {field.label}
          {isRequired && (
            <Text as="span" color="orange.500">
              *
            </Text>
          )}
        </Text>
      </Flex>
      <Box w="300px">
        <MatchColumnSelect
          placeholder={translations.matchColumnsStep.selectPlaceholder}
          value={selectedOption}
          onChange={(opt) => onMap(field.key as T, opt ? Number(opt.value) : null)}
          options={groupedOptions}
          name={field.label}
        />
      </Box>
      <Box w="300px" pl={4}>
        {sampleValue !== undefined && (
          <Text sx={styles.userTable.cell} noOfLines={1}>
            {sampleValue}
          </Text>
        )}
      </Box>
    </Flex>
  )
}
