import { render } from "@testing-library/react"
import { ReactSpreadsheetImport } from "../ReactSpreadsheetImport"
import { mockRsiValues } from "../stories/mockRsiValues"

/**
 * Regression test: RSI is embedded in host apps that run their own Chakra v3 system with the same
 * `--chakra-colors-*` variable names. RSI's token CSS must therefore never define color variables on a
 * bare `:root` (or any other selector that isn't scoped to RSI's `.rsi-root` wrappers) — a `:root` rule
 * carrying RSI's light values pins the host page to light mode whenever RSI is mounted, even closed.
 * (The historical culprit: a `:root &` term in the system's `light` condition.)
 */

const collectRules = (): CSSStyleRule[] => {
  const rules: CSSStyleRule[] = []
  const walk = (list: CSSRuleList) => {
    for (const rule of Array.from(list)) {
      const grouped = (rule as CSSGroupingRule).cssRules
      if (grouped && grouped.length) walk(grouped)
      if ((rule as CSSStyleRule).selectorText) rules.push(rule as CSSStyleRule)
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      walk(sheet.cssRules)
    } catch {
      // cross-origin or unparsable sheet — nothing RSI emits falls in this bucket
    }
  }
  return rules
}

test("mounting RSI emits no --chakra-colors-* variables on an unscoped selector", () => {
  render(<ReactSpreadsheetImport {...mockRsiValues} isOpen={false} onClose={() => {}} />)

  // rules that DEFINE chakra color variables (referencing them via var() is fine anywhere)
  const colorVarRules = collectRules().filter((rule) =>
    Array.from(rule.style).some((property) => property.startsWith("--chakra-colors-")),
  )

  // Guard against a vacuous pass: RSI's scoped token rules must actually be present and parsed
  expect(colorVarRules.some((rule) => rule.selectorText.includes(".rsi-root"))).toBe(true)

  const unscoped = colorVarRules.flatMap((rule) =>
    rule.selectorText
      .split(",")
      .map((part) => part.trim())
      .filter((part) => !part.includes(".rsi-root"))
      .map((part) => `${part}  ->  ${rule.cssText.slice(0, 120)}`),
  )
  expect(unscoped).toEqual([])
})
