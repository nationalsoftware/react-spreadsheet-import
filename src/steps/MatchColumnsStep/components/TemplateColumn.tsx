import { Flex, Text, Box, useStyleConfig } from "@chakra-ui/react"
import { useRsi } from "../../../hooks/useRsi"
import type { Column } from "../MatchColumnsStep"
import { ColumnType } from "../MatchColumnsStep"
import { MatchIcon } from "./MatchIcon"
import { MatchColumnSelect } from "../../../components/Selects/MatchColumnSelect"
import type { Styles } from "./ColumnGrid"

type TemplateColumnProps<T extends string> = {
  onChange: (val: T, index: number) => void
  column: Column<T>
}

export const TemplateColumn = <T extends string>({ column, onChange }: TemplateColumnProps<T>) => {
  const { translations, fields } = useRsi<T>()
  const styles = useStyleConfig("MatchColumnsStep") as Styles
  const isIgnored = column.type === ColumnType.ignored
  const isChecked = column.type === ColumnType.matched || column.type === ColumnType.matchedCheckbox
  const selectOptions = fields.map(({ label, key }) => ({ value: key, label }))
  const selectValue = selectOptions.find(({ value }) => "value" in column && column.value === value)

  return (
    <Flex minH={14} w="100%" flexDir="column" justifyContent="center">
      {isIgnored ? (
        <Text sx={styles.selectColumn.text}>{translations.matchColumnsStep.ignoredColumnText}</Text>
      ) : (
        <Flex alignItems="center" minH={10} w="100%">
          <MatchIcon isChecked={isChecked} />
          <Box flex={1}>
            <MatchColumnSelect
              placeholder={translations.matchColumnsStep.selectPlaceholder}
              value={selectValue}
              onChange={(value) => onChange(value?.value as T, column.index)}
              options={selectOptions}
              name={column.header}
            />
          </Box>
        </Flex>
      )}
    </Flex>
  )
}
