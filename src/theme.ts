import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"
import type { SystemStyleObject } from "@chakra-ui/react"
import type { DeepPartial } from "ts-essentials"
import type { ChakraStylesConfig } from "chakra-react-select"
import type { SelectOption } from "./types"

/**
 * Class applied to every RSI root element (the modal wrapper, alert dialogs, portalled menus,
 * tooltips and toasts). Chakra's CSS variables, preflight reset and global styles are scoped to
 * this class so the library never leaks styles into the host application.
 */
export const rsiRootClassName = "rsi-root"
const rsiRootSelector = `.${rsiRootClassName}`
/** Zero-specificity form used for the reset/global rules so they never out-rank recipe or `css` styles */
const rsiRootScope = `:where(${rsiRootSelector})`

export const themeOverrides = {
  colors: {
    textColor: "#2D3748",
    subtitleColor: "#525C6C",
    inactiveColor: "#A0AEC0",
    border: "#E2E8F0",
    background: "white",
    backgroundAlpha: "rgba(255,255,255,0)",
    secondaryBackground: "#EDF2F7",
    highlight: "#E2E8F0",
    rsi: {
      50: "#E6E6FF",
      100: "#C4C6FF",
      200: "#A2A5FC",
      300: "#8888FC",
      400: "#7069FA",
      500: "#5D55FA",
      600: "#4D3DF7",
      700: "#3525E6",
      800: "#1D0EBE",
      900: "#0C008C",
    },
  },
  components: {
    UploadStep: {
      baseStyle: {
        heading: {
          fontSize: "3xl",
          color: "textColor",
          mb: "1rem",
        },
        instructions: {
          fontSize: "md",
          lineHeight: 6,
          color: "subtitleColor",
          mb: "1rem",
        },
        title: {
          fontSize: "2xl",
          lineHeight: 8,
          fontWeight: "semibold",
          color: "textColor",
          mb: "1rem",
        },
        contentWrapper: {
          overflow: "hidden",
          alignItems: "normal",
          gap: "1rem",
          width: "100%",
          flex: 1,
        },
        tableWrapper: {
          overflow: "hidden",
          width: "50%",
        },
        dropzoneWrapper: {
          display: "flex",
          minWidth: "300px",
          flex: 1,
        },
        dropzoneText: {
          lineHeight: 7,
          fontWeight: "semibold",
          color: "textColor",
        },
        dropZoneBorder: "rsi.500",
        dropzoneButton: {
          mt: "1rem",
        },
      },
    },
    SelectSheetStep: {
      baseStyle: {
        heading: {
          color: "textColor",
          mb: "1rem",
          fontSize: "3xl",
        },
        instructions: {
          fontSize: "md",
          lineHeight: 6,
          color: "subtitleColor",
          mb: "2rem",
        },
        radio: {},
        radioLabel: {
          color: "textColor",
        },
      },
    },
    SelectHeaderStep: {
      baseStyle: {
        heading: {
          color: "textColor",
          mb: "1rem",
          fontSize: "3xl",
        },
        instructions: {
          fontSize: "md",
          lineHeight: 6,
          color: "subtitleColor",
          mb: "1rem",
        },
      },
    },
    MatchColumnsStep: {
      baseStyle: {
        heading: {
          fontSize: "3xl",
          color: "textColor",
          mb: "1rem",
        },
        instructions: {
          fontSize: "md",
          lineHeight: 6,
          color: "subtitleColor",
          mb: "1rem",
        },
        title: {
          fontSize: "2xl",
          lineHeight: 8,
          fontWeight: "semibold",
          color: "textColor",
        },
        userTable: {
          header: {
            fontSize: "xs",
            lineHeight: 5,
            fontWeight: "bold",
            letterSpacing: "wider",
            color: "textColor",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          },
          cell: {
            fontSize: "sm",
            lineHeight: 5,
            fontWeight: "medium",
            color: "textColor",
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
          },
        },
        selectColumn: {
          text: {
            fontSize: "sm",
            lineHeight: 5,
            fontWeight: "normal",
            color: "inactiveColor",
            px: 4,
          },
          accordionLabel: {
            color: "blue.600",
            fontSize: "sm",
            lineHeight: 5,
            pl: 1,
          },
          selectLabel: {
            pt: "0.375rem",
            pb: 2,
            fontSize: "md",
            lineHeight: 6,
            fontWeight: "medium",
            color: "textColor",
          },
        },
        select: {
          control: (provided) => ({
            ...provided,
            borderColor: "border",
            _hover: {
              borderColor: "border",
            },
            ["&[data-focus-visible]"]: {
              borderColor: "border",
              boxShadow: "none",
              outline: "none",
            },
          }),
          menu: (provided) => ({
            ...provided,
            p: 0,
            mt: 0,
          }),
          menuList: (provided) => ({
            ...provided,
            bg: "background",
            borderColor: "border",
          }),
          option: (provided, state) => ({
            ...provided,
            color: "textColor",
            bg: state.isSelected ? "green.100" : state.isFocused ? "green.50" : "background",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "block",
            whiteSpace: "nowrap",
            _hover: {
              bg: "green.50",
            },
          }),
          groupHeading: (provided) => ({
            ...provided,
            bg: "secondaryBackground",
            color: "subtitleColor",
            borderBottomWidth: "1px",
            borderBottomColor: "border",
            py: 2,
            px: 3,
            mb: 0,
          }),
          placeholder: (provided) => ({
            ...provided,
            color: "inactiveColor",
          }),
          noOptionsMessage: (provided) => ({
            ...provided,
            color: "inactiveColor",
          }),
        } as ChakraStylesConfig<SelectOption>,
      },
    },
    ValidationStep: {
      baseStyle: {
        heading: {
          fontSize: "3xl",
          color: "textColor",
          mb: "1rem",
        },
        instructions: {
          fontSize: "md",
          lineHeight: 6,
          color: "subtitleColor",
          mb: "1rem",
        },
        exportMenuItemTitle: {
          fontSize: "md",
          fontWeight: "medium",
          color: "textColor",
        },
        exportMenuItemDescription: {
          fontSize: "md",
          color: "subtitleColor",
        },
        select: {
          valueContainer: (provided) => ({
            ...provided,
            py: 0,
            px: 1.5,
          }),
          inputContainer: (provided) => ({ ...provided, py: 0 }),
          control: (provided) => ({ ...provided, border: "none" }),
          input: (provided) => ({ ...provided, color: "textColor" }),
          menu: (provided) => ({
            ...provided,
            p: 0,
            mt: 0,
            boxShadow: "md",
          }),
          menuList: (provided) => ({
            ...provided,
            bg: "secondaryBackground",
            borderColor: "inactiveColor",
          }),
          option: (provided, state) => ({
            ...provided,
            color: "textColor",
            bg: state.isSelected || state.isFocused ? "highlight" : "background",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "block",
            whiteSpace: "nowrap",
          }),
          noOptionsMessage: (provided) => ({
            ...provided,
            color: "inactiveColor",
          }),
        } as ChakraStylesConfig<SelectOption>,
      },
    },
    MatchIcon: {
      baseStyle: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        borderWidth: "2px",
        bg: "background",
        borderColor: "yellow.500",
        color: "background",
        transitionDuration: "fastest",
        _highlighted: {
          bg: "green.500",
          borderColor: "green.500",
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: "lg",
          bg: "background",
          fontSize: "lg",
          color: "textColor",
        },
        closeModalButton: {},
        backButton: {
          gridColumn: "1",
          gridRow: "1",
          justifySelf: "start",
        },
        continueButton: {
          gridColumn: "1 / 3",
          gridRow: "1",
          justifySelf: "center",
        },
      },
      variants: {
        rsi: {
          header: {
            bg: "secondaryBackground",
            px: "2rem",
            py: "1.5rem",
          },
          body: {
            bg: "background",
            display: "flex",
            paddingX: "2rem",
            paddingY: "2rem",
            flexDirection: "column",
            flex: 1,
            overflow: "auto",
            height: "100%",
          },
          footer: {
            bg: "secondaryBackground",
            py: "1.5rem",
            px: "2rem",
            justifyContent: "center",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr",
            gap: "1rem",
          },
          dialog: {
            outline: "unset",
            minH: "calc(var(--chakra-vh) - 4rem)",
            maxW: "calc(var(--chakra-vw) - 4rem)",
            my: "2rem",
            borderRadius: "3xl",
            overflow: "hidden",
          },
        },
      },
    },
    Button: {
      baseStyle: {},
      defaultProps: {
        colorPalette: "rsi",
      },
    },
  },
  styles: {
    global: {
      // supporting older browsers but avoiding fill-available CSS as it doesn't work https://github.com/chakra-ui/chakra-ui/blob/073bbcd21a9caa830d71b61d6302f47aaa5c154d/packages/components/css-reset/src/css-reset.tsx#L5
      [rsiRootSelector]: {
        "--chakra-vh": "100vh",
        "--chakra-vw": "100vw",
      },
      "@supports (height: 100dvh) and (width: 100dvw) ": {
        [rsiRootSelector]: {
          "--chakra-vh": "100dvh",
          "--chakra-vw": "100dvw",
        },
      },
      ".rdg": {
        contain: "size layout style paint",
        borderRadius: "lg",
        border: "none",
        borderTop: "1px solid var(--rdg-border-color)",
        blockSize: "100%",
        flex: "1",

        // Chakra v3 resolves bare token paths for custom properties, e.g. "colors.textColor" -> var(--chakra-colors-text-color)
        "--rdg-color": "colors.textColor",
        "--rdg-background-color": "colors.background",
        "--rdg-header-background-color": "colors.background",
        "--rdg-row-hover-background-color": "colors.background",
        "--rdg-selection-color": "colors.blue.400",
        "--rdg-row-selected-background-color": "colors.rsi.50",
        "--row-selected-hover-background-color": "colors.rsi.100",
        "--rdg-error-cell-background-color": "colors.red.50",
        "--rdg-warning-cell-background-color": "colors.orange.50",
        "--rdg-info-cell-background-color": "colors.blue.50",
        "--rdg-border-color": "colors.border",
        "--rdg-frozen-cell-box-shadow": "none",
        "--rdg-font-size": "fontSizes.sm",
        // Chakra v3's reset sets `* { font: inherit }`; RSI emits it unlayered, which out-ranks react-data-grid's
        // own layered `font-size: var(--rdg-font-size)`, so restate it here (otherwise the grid inherits the dialog's lg).
        fontSize: "var(--rdg-font-size)",
      },
      ".rdg-header-row .rdg-cell": {
        color: "textColor",
        fontSize: "xs",
        lineHeight: 10,
        fontWeight: "bold",
        letterSpacing: "wider",
        textTransform: "uppercase",
        "--rdg-selection-color": "none",
        backgroundColor: "var(--rdg-header-background-color)",
        "&:first-of-type": {
          borderTopLeftRadius: "lg",
        },
        "&:last-child": {
          borderTopRightRadius: "lg",
        },
      },
      ".rdg-row:last-child .rdg-cell:first-of-type": {
        borderBottomLeftRadius: "lg",
      },
      ".rdg-row:last-child .rdg-cell:last-child": {
        borderBottomRightRadius: "lg",
      },
      ".rdg[dir='rtl'] .rdg-row:last-child .rdg-cell:first-of-type": {
        borderBottomRightRadius: "lg",
        borderBottomLeftRadius: "none",
      },
      ".rdg[dir='rtl'] .rdg-row:last-child .rdg-cell:last-child": {
        borderBottomLeftRadius: "lg",
        borderBottomRightRadius: "none",
      },
      ".rdg-cell": {
        contain: "size layout style paint",
        // react-data-grid's own (layered) cell padding is zeroed by the unlayered reset; restate it
        paddingInline: "8px",
        borderInlineEnd: "1px solid var(--rdg-border-color)",
        borderBottom: "1px solid var(--rdg-border-color)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        "&[aria-selected='true']": {
          outline: "none",
        },
        "&[aria-selected='true']:focus-within": {
          outline: "2px solid var(--rdg-selection-color)",
          outlineOffset: "-2px",
        },
        "&:first-of-type": {
          borderInlineStart: "1px solid var(--rdg-border-color)",
        },
        "&:last-child": {
          borderInlineEnd: "1px solid var(--rdg-border-color)",
        },
      },
      ".rdg-cell-frozen": {
        borderInlineEnd: "none",
      },
      ".rdg-cell-error": {
        backgroundColor: "var(--rdg-error-cell-background-color)",
      },
      ".rdg-cell-warning": {
        backgroundColor: "var(--rdg-warning-cell-background-color)",
      },
      ".rdg-cell-info": {
        backgroundColor: "var(--rdg-info-cell-background-color)",
      },
      ".rdg-static": {
        cursor: "pointer",
      },
      ".rdg-static .rdg-header-row": {
        display: "none",
      },
      ".rdg-static .rdg-cell": {
        "--rdg-selection-color": "none",
      },
      ".rdg-example": {
        overflowY: "auto",
      },
      ".rdg-example .rdg-cell": {
        "--rdg-selection-color": "none",
      },
      ".rdg-radio": {
        display: "flex",
        alignItems: "center",
      },
      ".rdg-checkbox": {
        "--rdg-selection-color": "none",
        backgroundColor: "var(--rdg-header-background-color)",
        display: "flex",
        alignItems: "center",
      },
      ".rdg-cell-numeric": {
        fontVariantNumeric: "tabular-nums",
      },
      ".rdg-cell-rownum": {
        backgroundColor: "var(--rdg-header-background-color)",
        color: "textColor",
        fontSize: "xs",
        fontWeight: "bold",
        fontVariantNumeric: "tabular-nums",
        textAlign: "end",
      },
    },
  },
} as const

export const rtlThemeSupport = {
  components: {
    Modal: {
      baseStyle: {
        dialog: {
          direction: "rtl",
        },
      },
    },
  },
} as const

export type RsiTheme = typeof themeOverrides
export type CustomTheme = DeepPartial<RsiTheme>

type TokenValue = { value: string }
type ColorTokens = Record<string, TokenValue | Record<string, TokenValue>>

const isPalette = (value: unknown): value is Record<string, string> => typeof value === "object" && value !== null

/**
 * Chakra v3's default global styles target `html` and `*`. Re-key them under the RSI root selector so
 * they only affect RSI's own UI and never the host page.
 */
const scopeDefaultGlobalCss = (): Record<string, SystemStyleObject> => {
  const scoped: Record<string, SystemStyleObject> = {}
  for (const [selector, styles] of Object.entries(defaultConfig.globalCss ?? {})) {
    if (selector === "html") {
      // `bg` intentionally dropped: the root wrapper must not paint over the host page
      const { bg: _bg, background: _background, ...rest } = styles as Record<string, unknown>
      scoped[rsiRootScope] = rest as SystemStyleObject
    } else if (selector === "*") {
      scoped[`${rsiRootScope}, ${rsiRootScope} *`] = styles
    } else {
      scoped[
        selector
          .split(",")
          .map((part) => `${rsiRootScope} ${part.trim()}`)
          .join(", ")
      ] = styles
    }
  }
  return scoped
}

/**
 * Chakra v2 exposed numeric line-height tokens (`lineHeight: 6` → 1.5rem); v3 does not, and a bare number
 * would become a unitless multiplier. Re-register the v2 scale so theme values keep their meaning.
 */
const v2LineHeights = Object.fromEntries([3, 4, 5, 6, 7, 8, 9, 10].map((n) => [String(n), { value: `${n * 0.25}rem` }]))

/** `defaultProps.colorPalette`, still accepting the Chakra v2 `colorScheme` key from older `customTheme` objects */
const buttonColorPalette = (theme: RsiTheme): string => {
  const defaultProps = theme.components.Button.defaultProps as { colorPalette?: string; colorScheme?: string }
  return defaultProps.colorPalette ?? defaultProps.colorScheme ?? "rsi"
}

/**
 * Builds a Chakra v3 system from an RSI theme object (the default theme deep-merged with `customTheme`).
 *
 * - flat `colors` entries become semantic color tokens (e.g. `textColor`, `background`)
 * - nested `colors` entries become palettes (e.g. `rsi.500`) and get the semantic tokens Chakra v3
 *   recipes expect (`solid`, `contrast`, `fg`, ...) so `colorPalette="rsi"` works
 * - `styles.global` becomes `globalCss`
 * - CSS variables, the preflight reset and global styles are scoped to `.rsi-root`
 */
export const createRsiSystem = (theme: RsiTheme) => {
  const tokens: ColorTokens = {}
  const semanticTokens: ColorTokens = {}

  for (const [name, value] of Object.entries(theme.colors) as [string, string | Record<string, string>][]) {
    if (isPalette(value)) {
      tokens[name] = Object.fromEntries(Object.entries(value).map(([shade, color]) => [shade, { value: color }]))
      semanticTokens[name] = {
        contrast: { value: "white" },
        fg: { value: `{colors.${name}.700}` },
        subtle: { value: `{colors.${name}.100}` },
        muted: { value: `{colors.${name}.200}` },
        emphasized: { value: `{colors.${name}.300}` },
        solid: { value: `{colors.${name}.500}` },
        focusRing: { value: `{colors.${name}.500}` },
        border: { value: `{colors.${name}.500}` },
      }
    } else {
      semanticTokens[name] = { value }
    }
  }

  const config = defineConfig({
    cssVarsRoot: rsiRootSelector,
    // Layers are disabled so RSI styles behave like ordinary (v2-style) CSS inside arbitrary host apps;
    // the reset is therefore scoped with :where() so it cannot out-rank recipe classes.
    preflight: { scope: rsiRootScope },
    disableLayers: true,
    globalCss: {
      ...scopeDefaultGlobalCss(),
      ...(theme.styles.global as Record<string, SystemStyleObject>),
    },
    theme: {
      tokens: { colors: tokens, lineHeights: v2LineHeights },
      semanticTokens: { colors: semanticTokens },
      recipes: {
        button: {
          base: {
            ...(theme.components.Button.baseStyle as SystemStyleObject),
            colorPalette: buttonColorPalette(theme),
          },
        },
      },
    },
  })

  // globalCss is replaced (not merged) with the scoped copy built above
  return createSystem({ ...defaultConfig, globalCss: {} }, config)
}
