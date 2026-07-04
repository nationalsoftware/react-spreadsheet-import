import { StepState, StepType, UploadFlow } from "./UploadFlow"
import { ModalHeader } from "@chakra-ui/react"
import { Stepper } from "../components/Stepper"

import { useRsi } from "../hooks/useRsi"
import { useRef, useState } from "react"
import { steps, stepTypeToStepIndex, stepIndexToStepType } from "../utils/steps"

export const Steps = () => {
  const { initialStepState, translations, isNavigationEnabled } = useRsi()

  const initialStep = stepTypeToStepIndex(initialStepState?.type)

  const [activeStep, setActiveStep] = useState(initialStep)

  const [state, setState] = useState<StepState>(initialStepState || { type: StepType.upload })

  const history = useRef<StepState[]>([])

  const onClickStep = (stepIndex: number) => {
    const type = stepIndexToStepType(stepIndex)
    const historyIdx = history.current.findIndex((v) => v.type === type)
    if (historyIdx === -1) return
    const nextHistory = history.current.slice(0, historyIdx + 1)
    history.current = nextHistory
    setState(nextHistory[nextHistory.length - 1])
    setActiveStep(stepIndex)
  }

  const onBack = () => {
    onClickStep(Math.max(activeStep - 1, 0))
  }

  const onNext = (v: StepState) => {
    history.current.push(state)
    setState(v)
    setActiveStep(stepTypeToStepIndex(v.type))
  }

  return (
    <>
      <ModalHeader display={["none", "none", "block"]}>
        <Stepper
          activeStep={activeStep}
          labels={steps.map((key) => translations[key].title)}
          onClickStep={isNavigationEnabled ? onClickStep : undefined}
        />
      </ModalHeader>
      <UploadFlow state={state} onNext={onNext} onBack={isNavigationEnabled ? onBack : undefined} />
    </>
  )
}
