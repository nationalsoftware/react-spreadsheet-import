import { Box, Flex, Text } from "@chakra-ui/react"
import { CgCheck } from "react-icons/cg"

interface StepperProps {
  activeStep: number
  labels: string[]
  onClickStep?: (index: number) => void
}

export const Stepper = ({ activeStep, labels, onClickStep }: StepperProps) => (
  <Flex width="100%" align="center">
    {labels.map((label, index) => {
      const isCompleted = index < activeStep
      const isActive = index === activeStep
      const isFilled = isCompleted || isActive
      const isLast = index === labels.length - 1
      const isClickable = !!onClickStep && isCompleted
      return (
        <Flex key={label} flex={isLast ? "0 0 auto" : 1} align="center">
          <Flex
            as={isClickable ? "button" : "div"}
            tabIndex={isClickable ? 0 : undefined}
            w={10}
            h={10}
            flexShrink={0}
            borderRadius="full"
            bg={isFilled ? "green.500" : "background"}
            borderWidth="2px"
            borderColor={isFilled ? "green.500" : "gray.400"}
            align="center"
            justify="center"
            color={isFilled ? "white" : "gray.500"}
            fontWeight="bold"
            fontSize="md"
            cursor={isClickable ? "pointer" : "default"}
            onClick={isClickable ? () => onClickStep(index) : undefined}
          >
            {isCompleted ? <CgCheck size="36px" /> : index + 1}
          </Flex>
          <Text fontSize="md" color="textColor" ml={2} flexShrink={0}>
            {label}
          </Text>
          {!isLast && <Box flex={1} height="2px" bg={isCompleted ? "green.500" : "gray.300"} mx={3} />}
        </Flex>
      )
    })}
  </Flex>
)
