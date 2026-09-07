import { Select } from "chakra-react-select"
import type { GroupBase } from "chakra-react-select"
import type { SelectOption } from "../../types"
import { customComponents } from "./MenuPortal"
import { useRsiStyles } from "../../hooks/useRsiStyles"

interface Props {
  onChange: (value: SelectOption | null) => void
  value?: SelectOption
  options: readonly SelectOption[] | readonly GroupBase<SelectOption>[]
  placeholder?: string
  name?: string
}

export const MatchColumnSelect = ({ onChange, value, options, placeholder, name }: Props) => {
  const styles = useRsiStyles("MatchColumnsStep")
  return (
    <Select<SelectOption, false>
      value={value || null}
      tagColorPalette="gray"
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      chakraStyles={styles.select}
      menuPosition="fixed"
      components={customComponents}
      aria-label={name}
      isClearable
    />
  )
}
