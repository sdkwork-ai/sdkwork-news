export interface WeixinHostApi {
  getStorageSync(key: string): unknown;
  getWindowInfo?(): { statusBarHeight?: number };
  navigateBack(options?: { success?(): void; fail?(error: unknown): void }): void;
  navigateTo(options: { url: string; success?(): void; fail?(error: unknown): void }): void;
  setClipboardData(options: { data: string; success?(): void; fail?(error: unknown): void }): void;
  setStorageSync(key: string, value: unknown): void;
  showToast(options: { title: string; icon?: "none" | "success" }): void;
  switchTab(options: { url: string; success?(): void; fail?(error: unknown): void }): void;
  getSystemInfoSync?(): { statusBarHeight?: number };
}
