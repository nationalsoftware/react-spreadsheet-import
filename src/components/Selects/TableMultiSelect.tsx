import { rootId } from "../Providers"
import { Select } from "chakra-react-select"
import type { SelectOption } from "../../types"
import { useStyleConfig } from "@chakra-ui/react"
import type { themeOverrides } from "../../theme"

interface Props {
  onChange: (value: readonly SelectOption[]) => void
  value: SelectOption[]
  options: readonly SelectOption[]
}

export const TableMultiSelect = ({ onChange, value, options }: Props) => {
  const styles = useStyleConfig(
    "ValidationStep",
  ) as (typeof themeOverrides)["components"]["ValidationStep"]["baseStyle"]
  return (
    <Select<SelectOption, true>
      isMulti
      autoFocus
      useBasicStyles
      isClearable={false}
      size="sm"
      value={value}
      onChange={onChange}
      placeholder=" "
      closeMenuOnSelect={false}
      closeMenuOnScroll
      menuPosition="fixed"
      defaultMenuIsOpen
      menuPortalTarget={document.getElementById(rootId)}
      options={options}
      chakraStyles={{
        ...styles.select,
        valueContainer: (provided) => ({
          ...provided,
          py: 0,
          px: 1.5,
          flexWrap: "nowrap",
          overflow: "hidden",
        }),
        multiValueLabel: (provided) => ({
          ...provided,
          fontSize: "xs",
        }),
        multiValueRemove: (provided) => ({
          ...provided,
          w: 2,
          minW: 2,
        }),
      }}
    />
  )
}
