import { useEffect, useState } from "react";
import {
  NewsPcAccount,
  type NewsPcAccountStorage,
} from "@sdkwork/news-pc-account";
import { NewsPcAiStore } from "@sdkwork/news-pc-ai-store";
import { NewsPcAssistant } from "@sdkwork/news-pc-assistant";
import {
  NewsPcNews,
  type NewsPcShareInput,
} from "@sdkwork/news-pc-news";
import {
  NewsPcWorkspaceShell,
  type NewsPcWorkspaceTab,
} from "@sdkwork/news-pc-workspace-shell";
import type { NewsAgentService } from "@sdkwork/news-agent-service";
import type { NewsAccountService } from "@sdkwork/news-account-service";
import type { AiStoreService } from "@sdkwork/news-ai-store-service";
import type { NewsCommentsService } from "@sdkwork/news-comments-service";
import type { NewsFeedService } from "@sdkwork/news-feed-service";

const TAB_HASHES: Record<NewsPcWorkspaceTab, string> = {
  account: "account",
  assistant: "assistant",
  news: "news",
  store: "ai-store",
};

function resolveInitialTab(): NewsPcWorkspaceTab {
  const hash = window.location.hash.replace(/^#\/?/u, "");
  return (Object.entries(TAB_HASHES).find(([, value]) => value === hash)?.[0] as NewsPcWorkspaceTab | undefined)
    ?? "news";
}

export interface NewsPcAppProps {
  accountDemoMode: boolean;
  accountService?: NewsAccountService;
  accountStorage?: NewsPcAccountStorage;
  agentService?: NewsAgentService;
  aiStoreDemoMode: boolean;
  aiStoreService?: AiStoreService;
  assistantDemoMode: boolean;
  commentsService?: NewsCommentsService;
  newsDemoMode: boolean;
  newsService?: NewsFeedService;
}

export default function App({
  accountDemoMode,
  accountService,
  accountStorage,
  agentService,
  aiStoreDemoMode,
  aiStoreService,
  assistantDemoMode,
  commentsService,
  newsDemoMode,
  newsService,
}: NewsPcAppProps) {
  const [activeTab, setActiveTab] = useState<NewsPcWorkspaceTab>(resolveInitialTab);

  useEffect(() => {
    window.location.hash = `/${TAB_HASHES[activeTab]}`;
  }, [activeTab]);

  return (
    <NewsPcWorkspaceShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "assistant" && (
        <NewsPcAssistant demoMode={assistantDemoMode} service={agentService} />
      )}
      {activeTab === "news" && (
        <NewsPcNews
          commentsService={commentsService}
          demoMode={newsDemoMode}
          service={newsService}
          shareArticle={shareNewsArticle}
        />
      )}
      {activeTab === "store" && (
        <NewsPcAiStore demoMode={aiStoreDemoMode} service={aiStoreService} />
      )}
      {activeTab === "account" && (
        <NewsPcAccount
          demoMode={accountDemoMode}
          service={accountService}
          storage={accountStorage}
        />
      )}
    </NewsPcWorkspaceShell>
  );
}

async function shareNewsArticle(input: NewsPcShareInput): Promise<void> {
  const shareText = `${input.title}\n${input.text}\n${window.location.href}`;
  if (navigator.share) {
    await navigator.share({
      text: input.text,
      title: input.title,
      url: window.location.href,
    });
    return;
  }
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(shareText);
    return;
  }
  throw new Error("News sharing is unavailable in this browser.");
}
