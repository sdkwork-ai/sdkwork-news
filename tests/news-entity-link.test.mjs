import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  deriveEnglishShortNames,
  isCorroborated,
  needsCorroboration,
  detectEventTypes,
  eventDateOf,
  linkItems,
  matchesName,
  matchesTicker,
  materialityOf,
} from "../tools/news_entity_link_import.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

function fixture(name) {
  return JSON.parse(readFileSync(path.join(ROOT, "tests", "fixtures", name), "utf8"));
}

test("Chinese names match as literal substrings", () => {
  assert.equal(matchesName("贵州茅台发布三季报", "贵州茅台"), true);
  assert.equal(matchesName("白酒行业景气", "白酒Ⅱ"), false);
});

test("Latin names match on word boundaries only", () => {
  assert.equal(matchesName("Apple Inc. reports earnings", "Apple"), true);
  assert.equal(matchesName("Pineapple juice", "Apple"), false);
});

test("tickers match explicitly or as long standalone tokens", () => {
  assert.equal(matchesTicker("盘后 $AAPL 上涨", "AAPL"), "explicit");
  assert.equal(matchesTicker("关注 (MSFT) 财报", "MSFT"), "explicit");
  assert.equal(matchesTicker("NVDA 再创新高", "NVDA"), "bare");
  assert.equal(matchesTicker("A 股市场", "A"), null);
  assert.equal(matchesTicker("T 型车", "T"), null);
});

test("materiality raises event-style stories", () => {
  assert.equal(materialityOf("公司控制权变更，拟被收购"), "high");
  assert.equal(materialityOf("三季报净利润增长"), "medium");
});

test("corporate events are typed from title and summary", () => {
  assert.deepEqual(detectEventTypes("三季报净利润增长", ""), ["earnings"]);
  assert.deepEqual(detectEventTypes("拟收购标的公司控制权", ""), ["merger_acquisition"]);
  assert.deepEqual(detectEventTypes("半导体设备扩产，发布新品", ""), ["product"]);
  assert.equal(eventDateOf("2026年11月20日发布三季报", null), "2026-11-20");
  assert.equal(eventDateOf("无日期", "2026-11-21T02:00:00Z"), "2026-11-21");
});

test("English short names strip the corporate form a head line omits", () => {
  // News writes `Kweichow Moutai`, the filing writes `Kweichow Moutai Co.,Ltd.`.
  assert.deepEqual(deriveEnglishShortNames("Kweichow Moutai Co.,Ltd."), [
    "Kweichow Moutai Co.,Ltd",
    "Kweichow Moutai",
  ]);
  assert.deepEqual(deriveEnglishShortNames("Tencent Holdings Limited"), [
    "Tencent Holdings Limited",
    "Tencent Holdings",
    "Tencent",
  ]);
  assert.deepEqual(deriveEnglishShortNames("Apple Inc."), ["Apple Inc", "Apple"]);
  // `Company Limited` must be consumed before the bare `Co` alternative.
  assert.deepEqual(deriveEnglishShortNames("BYD Company Limited"), [
    "BYD Company Limited",
    "BYD",
  ]);
  // `Chase` must not lose its `se` to the European `SE` form.
  assert.deepEqual(deriveEnglishShortNames("JPMorgan Chase & Co."), [
    "JPMorgan Chase & Co",
    "JPMorgan Chase",
  ]);
});

test("English short names never drop interior words or emit fragments", () => {
  // Only trailing corporate forms are stripped.
  const names = deriveEnglishShortNames("Semiconductor Manufacturing International Corporation");
  assert.ok(names.includes("Semiconductor Manufacturing International Corporation"));
  // A name with no corporate form yields itself only.
  assert.deepEqual(deriveEnglishShortNames("RH"), []);
  assert.deepEqual(deriveEnglishShortNames(""), []);
});

test("a headline naming an issuer in English still resolves to one company", () => {
  const dictionary = [
    {
      entityType: "company",
      entityKey: "company-listed-cn-600519",
      symbol: "600519",
      displayName: "贵州茅台",
      marketCode: "CN_A",
      searchNames: ["贵州茅台", ...deriveEnglishShortNames("Kweichow Moutai Co.,Ltd.")],
    },
  ];
  const items = [
    {
      id: "news-item-maotai-en",
      title: "Kweichow Moutai reports third-quarter revenue growth",
    },
  ];
  const result = linkItems(dictionary, items);
  const links = result.perItem.get("news-item-maotai-en") ?? [];
  assert.equal(links.length, 1);
  assert.equal(links[0].entity.entityKey, "company-listed-cn-600519");
  assert.equal(links[0].role, "subject");
});

test("a bare short company name that is a common noun needs explicit attribution", () => {
  // 机器人 (300024) is also the everyday word "robot".
  assert.equal(needsCorroboration("机器人"), true);
  assert.equal(needsCorroboration("贵州茅台"), false);
  assert.equal(needsCorroboration("Apple"), false);

  // A humanoid-robot story is not a story about Siasun Robot, even though it
  // mentions 机器人, 股份 and 涨停.
  const bareTitle = "人形机器人概念再度拉升 维宏股份等十余股涨停";
  assert.equal(isCorroborated(bareTitle, bareTitle, "机器人", "300024"), false);

  const etfTitle = "机器人量产有望加速，机器人ETF鹏华涨超8%";
  assert.equal(isCorroborated(etfTitle, etfTitle, "机器人", "300024"), false);

  // The forms a finance desk actually uses do attribute the company.
  assert.equal(isCorroborated("机器人：拟收购标的资产", "机器人：拟收购标的资产", "机器人", "300024"), true);
  assert.equal(
    isCorroborated("机器人(300024)午后涨停", "机器人(300024)午后涨停", "机器人", "300024"),
    true,
  );
  assert.equal(isCorroborated("机器人公告称拟回购", "机器人公告称拟回购", "机器人", "300024"), true);

  // End to end: only the explicit article is attributed to the company.
  const dictionary = [
    {
      entityType: "company",
      entityKey: "company-listed-cn-300024",
      symbol: "300024",
      displayName: "机器人",
      marketCode: "CN_A",
      searchNames: ["机器人"],
    },
  ];
  const items = [
    { id: "news-item-robot-commonnoun", title: bareTitle },
    { id: "news-item-robot-company", title: "机器人：拟收购标的资产" },
  ];
  const result = linkItems(dictionary, items);
  assert.equal((result.perItem.get("news-item-robot-commonnoun") ?? []).length, 0);
  assert.equal((result.perItem.get("news-item-robot-company") ?? []).length, 1);
});

test("fixture links company, industry and sector entities", () => {
  const dictionary = fixture("company-news-dictionary.json").entities;
  const items = fixture("company-news-items.json");
  const result = linkItems(dictionary, items);
  const linksFor = (itemId) => result.perItem.get(itemId) ?? [];
  assert.ok(
    linksFor("news-item-maotai-q3").some(
      (link) => link.entity.entityKey === "company-listed-cn-600519" && link.role === "subject",
    ),
  );
  assert.ok(
    linksFor("news-item-semi").some(
      (link) => link.entity.entityKey === "company-sector-domestic-substitution",
    ),
  );
  assert.ok(
    linksFor("news-item-aapl").some(
      (link) => link.entity.entityKey === "company-listing-us-aapl" && link.role === "subject",
    ),
  );
  assert.equal(linksFor("news-item-macro").length, 0);
  assert.equal(result.feeds.length, result.links.length);
  assert.ok(
    result.perItemEvents
      .get("news-item-maotai-q3")
      .some((event) => event.eventType === "earnings"),
  );
  assert.ok(
    result.perItemEvents
      .get("news-item-semi")
      .some((event) => event.eventType === "product"),
  );
  assert.equal(result.perItemEvents.get("news-item-macro").length, 0);
});
