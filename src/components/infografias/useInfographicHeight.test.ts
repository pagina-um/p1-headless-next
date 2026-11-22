import { useEffect, type EffectCallback } from "react";
import { useInfographicHeight } from "./useInfographicHeight";
import { INFOGRAPHIC_HEIGHT_REQUEST_TYPE } from "./embed";

jest.mock("react", () => ({ useEffect: jest.fn() }));

describe("infographic content height reporting", () => {
  const origin = "https://preview.example";
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalObserver = Object.getOwnPropertyDescriptor(
    globalThis,
    "ResizeObserver"
  );
  let cleanup: (() => void) | undefined;
  let currentHeight: number;
  let animationId: number;
  let callbacks: Map<number, FrameRequestCallback>;
  let listeners: Map<string, Set<EventListener>>;
  let observers: TestObserver[];
  let parentWindow: { postMessage: jest.Mock };
  let cancelAnimationFrame: jest.Mock;

  class TestObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    constructor(private readonly callback: ResizeObserverCallback) {
      observers.push(this);
    }
    notify() {
      this.callback([], this as unknown as ResizeObserver);
    }
  }

  function flushFrame() {
    const pending = Array.from(callbacks.values());
    callbacks.clear();
    pending.forEach((callback) => callback(0));
  }

  function request(source: unknown = parentWindow, requestOrigin = origin) {
    const event = {
      source,
      origin: requestOrigin,
      data: { type: INFOGRAPHIC_HEIGHT_REQUEST_TYPE },
    } as MessageEvent;
    listeners.get("message")?.forEach((listener) => listener(event));
  }

  function mount(enabled = true) {
    const element = {
      getBoundingClientRect: () => ({ height: currentHeight }),
    } as unknown as HTMLElement;
    // The mocked effect runner lets this unit test exercise observers without a DOM.
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useInfographicHeight({ current: element }, enabled);
    return element;
  }

  beforeEach(() => {
    cleanup = undefined;
    currentHeight = 800;
    animationId = 0;
    callbacks = new Map();
    listeners = new Map();
    observers = [];
    parentWindow = { postMessage: jest.fn() };
    cancelAnimationFrame = jest.fn((id: number) => callbacks.delete(id));
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: {
        parent: parentWindow,
        location: { origin },
        requestAnimationFrame: (callback: FrameRequestCallback) => {
          const id = ++animationId;
          callbacks.set(id, callback);
          return id;
        },
        cancelAnimationFrame,
        addEventListener: (type: string, listener: EventListener) => {
          if (!listeners.has(type)) listeners.set(type, new Set());
          listeners.get(type)?.add(listener);
        },
        removeEventListener: (type: string, listener: EventListener) => {
          listeners.get(type)?.delete(listener);
        },
      },
    });
    Object.defineProperty(globalThis, "ResizeObserver", {
      configurable: true,
      value: TestObserver,
    });
    (useEffect as jest.Mock).mockImplementation((effect: EffectCallback) => {
      const result = effect();
      cleanup = typeof result === "function" ? result : undefined;
    });
  });

  afterEach(() => {
    cleanup?.();
    jest.clearAllMocks();
    if (originalWindow)
      Object.defineProperty(globalThis, "window", originalWindow);
    else Reflect.deleteProperty(globalThis, "window");
    if (originalObserver)
      Object.defineProperty(globalThis, "ResizeObserver", originalObserver);
    else Reflect.deleteProperty(globalThis, "ResizeObserver");
  });

  test("reports the measured content growing and shrinking, not the viewport", () => {
    const element = mount();
    expect(observers[0].observe).toHaveBeenCalledWith(element);
    flushFrame();
    currentHeight = 1430.25;
    observers[0].notify();
    flushFrame();
    currentHeight = 800;
    observers[0].notify();
    flushFrame();
    expect(
      parentWindow.postMessage.mock.calls.map(([message]) => message.height)
    ).toEqual([800, 1431, 800]);
    expect(
      parentWindow.postMessage.mock.calls.every((call) => call[1] === origin)
    ).toBe(true);
  });

  test("suppresses unchanged reports but answers a fresh load handshake", () => {
    mount();
    flushFrame();
    observers[0].notify();
    flushFrame();
    expect(parentWindow.postMessage).toHaveBeenCalledTimes(1);
    request();
    flushFrame();
    expect(parentWindow.postMessage).toHaveBeenCalledTimes(2);
    expect(parentWindow.postMessage.mock.calls[1][0].height).toBe(800);
  });

  test("ignores height requests from another window or origin", () => {
    mount();
    flushFrame();
    request({});
    request(parentWindow, "https://externo.example");
    flushFrame();
    expect(parentWindow.postMessage).toHaveBeenCalledTimes(1);
  });

  test("does no embed work when disabled", () => {
    mount(false);
    flushFrame();
    expect(observers).toHaveLength(0);
    expect(parentWindow.postMessage).not.toHaveBeenCalled();
    expect(listeners.size).toBe(0);
  });

  test("cleans up observers, both listeners and a pending measurement", () => {
    mount();
    expect(callbacks.size).toBe(1);
    cleanup?.();
    cleanup = undefined;
    expect(observers[0].disconnect).toHaveBeenCalledTimes(1);
    expect(listeners.get("message")?.size).toBe(0);
    expect(listeners.get("resize")?.size).toBe(0);
    expect(cancelAnimationFrame).toHaveBeenCalledTimes(1);
    expect(callbacks.size).toBe(0);
    observers[0].notify();
    flushFrame();
    expect(parentWindow.postMessage).not.toHaveBeenCalled();
  });
});
