const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"] as const;

export function formatMiniProgramToday(now = new Date()): string {
  return `${now.getMonth() + 1}月${now.getDate()}日${WEEKDAYS[now.getDay()]}`;
}

export function formatReadMinutes(value?: number): string {
  return value && value > 0 ? `${value} 分钟` : "3 分钟";
}

export function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength)}…` : value;
}
