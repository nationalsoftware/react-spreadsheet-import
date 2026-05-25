import "@testing-library/jest-dom"
import { vi } from "vitest"

// Yeeted from https://github.com/adazzle/react-data-grid/blob/main/test/setup.ts
if (typeof window !== "undefined") {
  window.ResizeObserver ??= class {
    callback: ResizeObserverCallback

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback
    }

    observe() {
      this.callback([], this)
    }

    unobserve() {}
    disconnect() {}
  }

  // patch clientWidth/clientHeight to pretend we're rendering DataGrid at 1080p
  Object.defineProperties(HTMLDivElement.prototype, {
    clientWidth: {
      get(this: HTMLDivElement) {
        return this.classList.contains("rdg") ? 1920 : 0
      },
    },
    clientHeight: {
      get(this: HTMLDivElement) {
        return this.classList.contains("rdg") ? 1080 : 0
      },
    },
  })

  Element.prototype.setPointerCapture ??= () => {}

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // Deprecated
      removeListener: vi.fn(), // Deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })

  Object.defineProperty(globalThis, "ResizeObserver", {
    writable: true,
    value: vi.fn(function () {
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }
    }),
  })

  Object.defineProperty(window.HTMLElement.prototype, "scrollIntoView", {
    writable: true,
    value: vi.fn(),
  })
}
