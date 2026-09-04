import { rootId } from "../Providers"
import { Select } from "chakra-react-select"
import type { SelectOption } from "../../types"
import { useRsiStyles } from "../../hooks/useRsiStyles"

interface Props {
  onChange: (value: SelectOption | null) => void
  value?: SelectOption
  options: readonly SelectOption[]
}

export const TableSelect = ({ onChange, value, options }: Props) => {
  const styles = useRsiStyles("ValidationStep")
  return (
    <Select<SelectOption, false>
      autoFocus
      isClearable
      size="sm"
      value={value}
      onChange={onChange}
      placeholder=" "
      closeMenuOnScroll
      menuPosition="fixed"
      defaultMenuIsOpen
      menuPortalTarget={document.getElementById(rootId)}
      options={options}
      chakraStyles={styles.select}
    />
  )
}
