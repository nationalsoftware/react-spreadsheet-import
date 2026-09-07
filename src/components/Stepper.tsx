import { Steps } from "@chakra-ui/react"
import { CgCheck } from "react-icons/cg"

interface StepperProps {
  activeStep: number
  labels: string[]
  onClickStep?: (index: number) => void
}

export const Stepper = ({ activeStep, labels, onClickStep }: StepperProps) => (
  <Steps.Root
    step={activeStep}
    count={labels.length}
    onStepChange={({ step }) => onClickStep?.(step)}
    colorPalette="green"
    width="100%"
  >
    <Steps.List>
      {labels.map((label, index) => {
        // only completed steps can be navigated back to, and only when navigation is enabled
        const isClickable = !!onClickStep && index < activeStep
        const content = (
          <>
            <Steps.Indicator>
              <Steps.Status complete={<CgCheck />} incomplete={<Steps.Number />} />
            </Steps.Indicator>
            <Steps.Title>{label}</Steps.Title>
          </>
        )
        return (
          <Steps.Item key={label} index={index}>
            {isClickable ? <Steps.Trigger>{content}</Steps.Trigger> : content}
            <Steps.Separator />
          </Steps.Item>
        )
      })}
    </Steps.List>
  </Steps.Root>
)
