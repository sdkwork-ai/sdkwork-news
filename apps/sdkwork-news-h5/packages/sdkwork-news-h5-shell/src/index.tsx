import type { ReactNode } from "react";
import { Bot, Compass, House, UserRound } from "lucide-react";
import "./styles.css";

export type NewsH5Tab = "assistant" | "news" | "store" | "account";

const TABS = [
  { id: "news" as const, label: "首页", icon: House },
  { id: "assistant" as const, label: "助手", icon: Bot },
  { id: "store" as const, label: "精选", icon: Compass },
  { id: "account" as const, label: "我的", icon: UserRound },
] as const;

export interface NewsH5ShellProps {
  activeTab: NewsH5Tab;
  children: ReactNode;
  onTabChange: (tab: NewsH5Tab) => void;
  showTabBar?: boolean;
}

/**
 * Mobile shell for the news application. The tab bar is composed once from
 * the route table so secondary pages can hide it as a whole.
 */
export function NewsH5Shell({
  activeTab,
  children,
  onTabChange,
  showTabBar = true,
}: NewsH5ShellProps) {
  return (
    <div className="news-h5-shell">
      <main>{children}</main>
      {showTabBar && (
        <nav aria-label="主导航">
          {TABS.map(({ id, label, icon: Icon }) => {
            const selected = id === activeTab;
            return (
              <button
                aria-current={selected ? "page" : undefined}
                className={selected ? "is-active" : ""}
                key={id}
                onClick={() => onTabChange(id)}
                type="button"
              >
                <span className="news-h5-shell__icon">
                  <Icon
                    aria-hidden="true"
                    fill={selected ? "currentColor" : "none"}
                    size={20}
                    strokeWidth={selected ? 2.2 : 1.9}
                  />
                </span>
                <span>{label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export default NewsH5Shell;
