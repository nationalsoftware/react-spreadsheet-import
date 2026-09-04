import { Heading, RadioGroup, Stack, Text } from "@chakra-ui/react"
import { useCallback, useState } from "react"
import { ContinueButton } from "../../components/ContinueButton"
import { ModalBody } from "../../components/ModalParts"
import { useRsi } from "../../hooks/useRsi"
import { useRsiStyles } from "../../hooks/useRsiStyles"

type SelectSheetProps = {
  sheetNames: string[]
  onContinue: (sheetName: string) => Promise<void>
  onBack?: () => void
}

export const SelectSheetStep = ({ sheetNames, onContinue, onBack }: SelectSheetProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const { translations } = useRsi()
  const [value, setValue] = useState(sheetNames[0])
  const styles = useRsiStyles("SelectSheetStep")
  const handleOnContinue = useCallback(
    async (data: typeof value) => {
      setIsLoading(true)
      await onContinue(data)
      setIsLoading(false)
    },
    [onContinue],
  )

  return (
    <>
      <ModalBody alignItems="center" justifyContent="center" p={8} flex={1}>
        <Heading css={styles.heading}>{translations.uploadStep.selectSheet.title}</Heading>
        <Text css={styles.instructions}>{translations.uploadStep.selectSheet.instructions}</Text>
        <RadioGroup.Root
          colorPalette="blue"
          value={value}
          onValueChange={({ value }) => {
            if (value !== null) setValue(value)
          }}
        >
          <Stack gap={8}>
            {sheetNames.map((sheetName) => (
              <RadioGroup.Item value={sheetName} key={sheetName} css={styles.radio}>
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>
                  <Text css={styles.radioLabel}>{sheetName}</Text>
                </RadioGroup.ItemText>
              </RadioGroup.Item>
            ))}
          </Stack>
        </RadioGroup.Root>
      </ModalBody>
      <ContinueButton
        isLoading={isLoading}
        onContinue={() => handleOnContinue(value)}
        onBack={onBack}
        title={translations.uploadStep.selectSheet.nextButtonTitle}
        backTitle={translations.uploadStep.selectSheet.backButtonTitle}
      />
    </>
  )
}
