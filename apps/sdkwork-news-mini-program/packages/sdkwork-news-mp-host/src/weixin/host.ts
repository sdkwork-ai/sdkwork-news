import {
  NewsHostError,
  type NewsMiniProgramHost,
} from "@sdkwork/news-mp-core";

import type { WeixinHostApi } from "./api.js";

export function createWeixinNewsMiniProgramHost(
  api: WeixinHostApi,
): NewsMiniProgramHost {
  return {
    copyText(text) {
      return new Promise<void>((resolve, reject) => {
        api.setClipboardData({
          data: text,
          fail: (error) => reject(toHostError(error, "Clipboard is unavailable.")),
          success: () => resolve(),
        });
      });
    },
    getStorage<T>(key: string) {
      try {
        const value = api.getStorageSync(key);
        return Promise.resolve(value === "" ? undefined : value as T | undefined);
      } catch (error) {
        return Promise.reject(toHostError(error, "Storage is unavailable."));
      }
    },
    navigateBack() {
      return new Promise<void>((resolve, reject) => {
        api.navigateBack({
          fail: (error) => reject(toHostError(error, "Back navigation failed.")),
          success: () => resolve(),
        });
      });
    },
    navigateTo(url) {
      return new Promise<void>((resolve, reject) => {
        api.navigateTo({
          url,
          fail: (error) => reject(toHostError(error, "Navigation failed.")),
          success: () => resolve(),
        });
      });
    },
    setStorage<T>(key: string, value: T) {
      try {
        api.setStorageSync(key, value);
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(toHostError(error, "Storage is unavailable."));
      }
    },
    showToast(message) {
      try {
        api.showToast({ icon: "none", title: message });
        return Promise.resolve();
      } catch (error) {
        return Promise.reject(toHostError(error, "Toast is unavailable."));
      }
    },
    statusBarHeight() {
      const info = api.getWindowInfo?.() ?? api.getSystemInfoSync?.();
      return info?.statusBarHeight ?? 24;
    },
    switchTab(url) {
      return new Promise<void>((resolve, reject) => {
        api.switchTab({
          url,
          fail: (error) => reject(toHostError(error, "Tab navigation failed.")),
          success: () => resolve(),
        });
      });
    },
  };
}

function toHostError(error: unknown, fallback: string): NewsHostError {
  const message =
    error && typeof error === "object" && "errMsg" in error
      ? String((error as { errMsg: unknown }).errMsg)
      : fallback;
  if (message.includes("cancel")) {
    return new NewsHostError("cancelled", message);
  }
  if (message.includes("auth") || message.includes("permission")) {
    return new NewsHostError("permission-denied", message);
  }
  return new NewsHostError("unavailable", message);
}
