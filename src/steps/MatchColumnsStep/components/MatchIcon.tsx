import { Box, Flex } from "@chakra-ui/react"
import { CgCheck } from "react-icons/cg"
import { useRsiStyles } from "../../../hooks/useRsiStyles"

type MatchIconProps = {
  isChecked: boolean
}

export const MatchIcon = (props: MatchIconProps) => {
  const style = useRsiStyles("MatchIcon")

  return (
    <Box
      css={style}
      minW={6}
      minH={6}
      w={6}
      h={6}
      ml="0.875rem"
      mr={3}
      data-highlighted={props.isChecked ? "" : undefined}
      data-testid="column-checkmark"
    >
      {props.isChecked && (
        <Flex animationStyle="scale-fade-in" animationDuration="faster">
          <CgCheck size="24px" />
        </Flex>
      )}
    </Box>
  )
}
