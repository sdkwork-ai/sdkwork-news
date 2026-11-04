interface WeixinHostGlobal {
  getStorageSync(key: string): unknown;
  getSystemInfoSync?(): { statusBarHeight?: number };
  getWindowInfo?(): { statusBarHeight?: number };
  navigateBack(options?: { success?(): void; fail?(error: unknown): void }): void;
  navigateTo(options: { url: string; success?(): void; fail?(error: unknown): void }): void;
  setClipboardData(options: { data: string; success?(): void; fail?(error: unknown): void }): void;
  setStorageSync(key: string, value: unknown): void;
  showToast(options: { title: string; icon?: "none" | "success" }): void;
  switchTab(options: { url: string; success?(): void; fail?(error: unknown): void }): void;
}

declare function App<T>(config: T): void;
declare function Page<T>(config: T): void;
declare function getApp<T = Record<string, unknown>>(): T;

declare const wx: WeixinHostGlobal;
