"use client";

import React, {
  useCallback,
  useMemo,
  useState,
  useSyncExternalStore,
  useTransition,
} from "react";
import Image from "next/image";
import {
  Search,
  History,
  Coins,
  QrCode,
  ExternalLink,
  Download,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  X,
  TrendingUp,
  ShoppingBag,
  Video,
  Megaphone,
  Globe,
  Clock,
  Sun,
  Moon,
  Loader2,
  Inbox,
  ChevronRight,
  Zap,
  Check,
} from "lucide-react";

import { MOCK_RESULTS, PLATFORMS, PLATFORM_MAP } from "./data";
import type { HistoryRecord, PlatformId, ResultItem } from "./types";

/* ------------------------------------------------------------------ */
/* Icon mapping                                                        */
/* ------------------------------------------------------------------ */

const CATEGORY_ICON = {
  ecom: ShoppingBag,
  video: Video,
  ads: Megaphone,
  social: Globe,
} as const;

/* ------------------------------------------------------------------ */
/* Theme hook                                                          */
/* ------------------------------------------------------------------ */

function useTheme() {
  // Read the DOM-resolved theme as an external store so React stays in sync
  // without a setState-in-effect cascade.
  const theme = useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );

  const toggle = useCallback(() => {
    const next = getThemeSnapshot() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("dataradar-theme", next);
    } catch {}
    document.documentElement.classList.toggle("dark", next === "dark");
    document.documentElement.style.colorScheme = next;
    window.dispatchEvent(new Event("dataradar-theme-change"));
  }, []);

  return { theme, toggle };
}

/* ------------------------------------------------------------------ */
/* Theme store — mirrors the pre-paint inline script in layout.tsx     */
/* ------------------------------------------------------------------ */

const THEME_EVENT = "dataradar-theme-change";

function getThemeSnapshot(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getThemeServerSnapshot(): "light" | "dark" {
  return "light";
}

function subscribeTheme(callback: () => void): () => void {
  window.addEventListener(THEME_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                           */
/* ------------------------------------------------------------------ */

export function Dashboard() {
  const { theme, toggle: toggleTheme } = useTheme();

  const [selectedPlatform, setSelectedPlatform] =
    useState<PlatformId>("tiktok_shop");
  const [query, setQuery] = useState("");
  const [credits, setCredits] = useState<number>(120);
  const [loading, setLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Tầng 1: Bộ lọc gửi kèm API gốc
  const [region, setRegion] = useState("VN");
  const [timeRange, setTimeRange] = useState("7d");
  const [sortBy, setSortBy] = useState("trending");
  const [adStatus, setAdStatus] = useState("ACTIVE");

  // Tầng 2: Bộ lọc tức thì trên kết quả đã tải (0 Xu)
  const [quickFilterText, setQuickFilterText] = useState("");
  const [minMetric, setMinMetric] = useState<number>(0);

  // Dữ liệu hiển thị & Lịch sử tìm kiếm
  const [results, setResults] =
    useState<ResultItem[]>(MOCK_RESULTS.tiktok_shop);
  const [activeSourceNote, setActiveSourceNote] = useState<string>(
    "Dữ liệu mẫu khởi động"
  );
  const [history, setHistory] = useState<HistoryRecord[]>([
    {
      id: "hist-init-1",
      platform: "tiktok_shop",
      keyword: "áo khoác kaki",
      filterSummary: "VN • Bán chạy",
      timestamp: "Hôm nay, 14:10",
      results: MOCK_RESULTS.tiktok_shop,
    },
  ]);

  const currentPlatformConfig = useMemo(
    () => PLATFORM_MAP[selectedPlatform] ?? PLATFORMS[0],
    [selectedPlatform]
  );

  /* -------------------------------------------------------------- */
  /* Handlers                                                        */
  /* -------------------------------------------------------------- */

  const handleSwitchPlatform = useCallback((platformId: PlatformId) => {
    startTransition(() => {
      setSelectedPlatform(platformId);
      setQuickFilterText("");
      setMinMetric(0);
      setResults(MOCK_RESULTS[platformId] ?? []);
      setActiveSourceNote("Sẵn sàng tra cứu");
    });
  }, []);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const cleanQuery = query.trim();
      if (!cleanQuery) return;

      // 1. Kiểm tra trùng trong Lịch sử (Cache 0 Xu)
      const cachedRecord = history.find(
        (h) =>
          h.platform === selectedPlatform &&
          h.keyword.toLowerCase() === cleanQuery.toLowerCase()
      );

      if (cachedRecord) {
        setResults(cachedRecord.results);
        setActiveSourceNote("Lấy từ Cache Lịch sử (Tiết kiệm: 0 Xu)");
        return;
      }

      // 2. Kiểm tra số dư Xu
      if (credits < currentPlatformConfig.cost) {
        setShowQrModal(true);
        return;
      }

      setLoading(true);
      try {
        // TODO: Khi dựng xong Backend Proxy, mở comment đoạn gọi API nội bộ dưới đây:
        /*
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: selectedPlatform,
            keyword: cleanQuery,
            filters: { region, timeRange, sortBy, adStatus },
          }),
        });
        const data = await res.json();
        */

        // Mô phỏng độ trễ gọi Proxy Backend
        await new Promise((resolve) => setTimeout(resolve, 650));

        const baseItems = MOCK_RESULTS[selectedPlatform] ?? [];
        const fetchedResults: ResultItem[] = baseItems.map((item, idx) => ({
          ...item,
          id: `${selectedPlatform}-${Date.now()}-${idx}`,
          title: `[${cleanQuery}] ${item.title}`,
        }));

        setCredits((prev) => prev - currentPlatformConfig.cost);
        setResults(fetchedResults);
        setActiveSourceNote(
          `Quét mới thành công (-${currentPlatformConfig.cost} Xu)`
        );

        const newHistoryItem: HistoryRecord = {
          id: `hist-${Date.now()}`,
          platform: selectedPlatform,
          keyword: cleanQuery,
          filterSummary: `${region} • ${timeRange}`,
          timestamp: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          results: fetchedResults,
        };
        setHistory((prev) => [newHistoryItem, ...prev]);
      } finally {
        setLoading(false);
      }
    },
    [query, history, selectedPlatform, credits, currentPlatformConfig, region, timeRange]
  );

  const handleLoadHistory = useCallback((record: HistoryRecord) => {
    startTransition(() => {
      setSelectedPlatform(record.platform);
      setQuery(record.keyword);
      setResults(record.results);
      setQuickFilterText("");
      setMinMetric(0);
      setActiveSourceNote("Mở từ Lịch sử đã lưu (Miễn phí 0 Xu)");
    });
  }, []);

  // Lọc tức thì Tầng 2 trên kết quả đã tải (0 Xu)
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      const matchText =
        !quickFilterText ||
        item.title.toLowerCase().includes(quickFilterText.toLowerCase()) ||
        item.author.toLowerCase().includes(quickFilterText.toLowerCase());
      const matchMetric = item.metricPrimaryNum >= minMetric;
      return matchText && matchMetric;
    });
  }, [results, quickFilterText, minMetric]);

  const isBusy = loading || isPending;

  /* -------------------------------------------------------------- */
  /* Render                                                          */
  /* -------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ---------------------------- Header ---------------------------- */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-solid text-on-primary shadow-md"
                aria-hidden="true"
              >
                <Zap className="size-5" strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-base font-bold tracking-tight text-foreground">
                    DataRadar
                  </span>
                  <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    VN
                  </span>
                </div>
                <span className="hidden truncate text-[11px] text-muted-foreground sm:block">
                  All-in-One Intelligence Platform
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Credit balance */}
              <div
                className="flex items-center gap-2 rounded-lg border border-border bg-muted px-2.5 py-1.5"
                title="Số dư Xu hiện tại"
              >
                <Coins className="size-4 shrink-0 text-accent" aria-hidden="true" />
                <span className="metric-value text-sm font-bold text-foreground">
                  {credits}
                </span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  Xu
                </span>
              </div>

              {/* Theme toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={
                  theme === "dark" ? "Chuyển giao diện sáng" : "Chuyển giao diện tối"
                }
                title="Đổi giao diện sáng/tối"
                className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary cursor-pointer"
              >
                {theme === "dark" ? (
                  <Sun className="size-4" aria-hidden="true" />
                ) : (
                  <Moon className="size-4" aria-hidden="true" />
                )}
              </button>

              {/* Top up */}
              <button
                type="button"
                onClick={() => setShowQrModal(true)}
                className="btn-accent flex items-center gap-2 px-3 py-2 text-sm shadow-sm sm:px-4"
              >
                <QrCode className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Nạp gói VietQR</span>
                <span className="sm:hidden">Nạp</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ------------------------- Main Layout ------------------------- */}
      <div className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-5 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          {/* ------------------------- Sidebar ------------------------- */}
          <aside className="lg:col-span-3 xl:col-span-3">
            <div className="surface sticky top-20 overflow-hidden">
              <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <History
                    className="size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <h2 className="text-sm font-semibold text-foreground">
                    Lịch sử đã quét
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1 rounded-md border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                  <Check className="size-3" aria-hidden="true" />
                  0 Xu
                </span>
              </div>

              <div className="scroll-thin max-h-[60vh] space-y-1.5 overflow-y-auto p-2">
                {history.length === 0 && (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    Chưa có lịch sử.
                    <br />
                    Hãy tìm kiếm để lưu lại.
                  </p>
                )}
                {history.map((item) => {
                  const pName =
                    PLATFORM_MAP[item.platform]?.shortName ?? item.platform;
                  const isActive = item.platform === selectedPlatform;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLoadHistory(item)}
                      className={`group w-full cursor-pointer rounded-lg border px-3 py-2.5 text-left transition-colors duration-200 ${
                        isActive
                          ? "border-primary/40 bg-primary/5"
                          : "border-transparent hover:border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate font-mono text-[11px] font-semibold text-primary">
                          {pName}
                        </span>
                        <span className="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="size-2.5" aria-hidden="true" />
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="mt-1 truncate text-sm font-medium text-foreground group-hover:text-primary">
                        {item.keyword}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                        {item.filterSummary}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ------------------------- Main ------------------------- */}
          <main className="space-y-4 lg:col-span-9 xl:col-span-9">
            {/* -------------------- Platform tabs -------------------- */}
            <section
              aria-label="Chọn nền tảng"
              className="surface p-1.5"
            >
              <div className="scroll-thin flex gap-1.5 overflow-x-auto">
                {PLATFORMS.map((platform) => {
                  const active = platform.id === selectedPlatform;
                  const Icon = CATEGORY_ICON[platform.category];
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => handleSwitchPlatform(platform.id)}
                      aria-pressed={active}
                      className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                        active
                          ? "bg-primary-solid text-on-primary shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      <Icon className="size-4 shrink-0" aria-hidden="true" />
                      <span className="whitespace-nowrap">
                        {platform.shortName}
                      </span>
                      <span
                        className={`metric-value rounded px-1.5 py-0.5 text-[10px] font-bold ${
                          active
                            ? "bg-black/25 text-on-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {platform.cost} Xu
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* -------------------- Search + filters -------------------- */}
            <section className="surface p-4 sm:p-5">
              <form
                onSubmit={handleSearch}
                className="flex flex-col gap-3 sm:flex-row"
              >
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={currentPlatformConfig.placeholder}
                    aria-label="Từ khóa tìm kiếm"
                    className="field h-11 w-full pl-10 pr-4 text-sm placeholder:text-muted-foreground"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isBusy}
                  className="btn-primary flex h-11 shrink-0 items-center justify-center gap-2 px-6 text-sm shadow-sm"
                >
                  {loading ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <Sparkles className="size-4" aria-hidden="true" />
                  )}
                  <span>{loading ? "Đang quét..." : "Tìm kiếm ngay"}</span>
                </button>
              </form>

              {/* Bộ lọc Tầng 1 */}
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <span className="flex items-center gap-1.5 pr-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <SlidersHorizontal
                    className="size-3.5 text-primary"
                    aria-hidden="true"
                  />
                  Bộ lọc quét
                </span>

                {(selectedPlatform === "tiktok_shop" ||
                  selectedPlatform === "shopee") && (
                  <>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      aria-label="Thị trường"
                      className="field h-8 cursor-pointer px-2.5 text-xs"
                    >
                      <option value="VN">Thị trường: Việt Nam (VN)</option>
                      <option value="TH">Thị trường: Thái Lan (TH)</option>
                      <option value="US">Thị trường: Mỹ (US)</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      aria-label="Cách sắp xếp"
                      className="field h-8 cursor-pointer px-2.5 text-xs"
                    >
                      <option value="trending">Sắp xếp: Bán chạy nhất</option>
                      <option value="price_asc">Giá: Thấp đến Cao</option>
                      <option value="price_desc">Giá: Cao đến Thấp</option>
                    </select>
                  </>
                )}

                {(selectedPlatform === "youtube" ||
                  selectedPlatform === "douyin") && (
                  <>
                    <select
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      aria-label="Khoảng thời gian"
                      className="field h-8 cursor-pointer px-2.5 text-xs"
                    >
                      <option value="7d">Thời gian: 7 ngày gần nhất</option>
                      <option value="15d">Thời gian: 15 ngày gần nhất</option>
                      <option value="30d">Thời gian: 30 ngày gần nhất</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      aria-label="Cách sắp xếp"
                      className="field h-8 cursor-pointer px-2.5 text-xs"
                    >
                      <option value="outlier">
                        Ưu tiên: Video bùng nổ (Outlier)
                      </option>
                      <option value="views">Nhiều lượt xem nhất</option>
                      <option value="newest">Mới đăng nhất</option>
                    </select>
                  </>
                )}

                {(selectedPlatform === "fb_ads" ||
                  selectedPlatform === "google_ads") && (
                  <>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      aria-label="Quốc gia Ads"
                      className="field h-8 cursor-pointer px-2.5 text-xs"
                    >
                      <option value="VN">Quốc gia Ads: Việt Nam</option>
                      <option value="ALL">Quốc gia Ads: Toàn cầu</option>
                    </select>
                    <select
                      value={adStatus}
                      onChange={(e) => setAdStatus(e.target.value)}
                      aria-label="Trạng thái Ads"
                      className="field h-8 cursor-pointer px-2.5 text-xs"
                    >
                      <option value="ACTIVE">
                        Trạng thái: Đang chạy (Active)
                      </option>
                      <option value="ALL">Tất cả mẫu quảng cáo</option>
                    </select>
                  </>
                )}
              </div>
            </section>

            {/* -------------------- Quick filter (Tầng 2) -------------------- */}
            <section className="surface flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <TrendingUp
                  className="size-4 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <span>
                  Hiển thị{" "}
                  <strong className="metric-value text-foreground">
                    {filteredResults.length}
                  </strong>{" "}
                  kết quả
                </span>
                <span className="text-muted-foreground" aria-hidden="true">
                  •
                </span>
                <span className="font-medium text-primary">
                  {activeSourceNote}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <label htmlFor="quick-filter" className="sr-only">
                  Lọc nhanh trong kết quả
                </label>
                <input
                  id="quick-filter"
                  type="text"
                  value={quickFilterText}
                  onChange={(e) => setQuickFilterText(e.target.value)}
                  placeholder="Lọc nhanh (0 Xu)..."
                  className="field h-8 w-44 px-2.5 text-xs placeholder:text-muted-foreground"
                />
                <label htmlFor="min-metric" className="sr-only">
                  Ngưỡng chỉ số
                </label>
                <select
                  id="min-metric"
                  value={minMetric}
                  onChange={(e) => setMinMetric(Number(e.target.value))}
                  className="field h-8 cursor-pointer px-2.5 text-xs"
                >
                  <option value={0}>Mọi mức chỉ số</option>
                  <option value={1000}>Chỉ số ≥ 1.000</option>
                  <option value={10000}>Chỉ số ≥ 10.000</option>
                  <option value={100000}>Chỉ số ≥ 100.000</option>
                </select>
              </div>
            </section>

            {/* -------------------- Results grid -------------------- */}
            {filteredResults.length === 0 ? (
              <div className="surface relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
                <div className="grid-backdrop pointer-events-none absolute inset-0" />
                <div className="relative">
                  <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl border border-border bg-muted">
                    <Inbox
                      className="size-6 text-muted-foreground"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">
                    Không có kết quả phù hợp
                  </h3>
                  <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
                    Thử bỏ bớt điều kiện lọc nhanh, hoặc tìm kiếm với từ khóa
                    khác để có thêm dữ liệu.
                  </p>
                  {(quickFilterText || minMetric > 0) && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuickFilterText("");
                        setMinMetric(0);
                      }}
                      className="btn-ghost mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-sm"
                    >
                      Xóa bộ lọc
                      <ChevronRight className="size-3.5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                {filteredResults.map((item, idx) => (
                  <article
                    key={item.id}
                    className="surface surface-interactive animate-fade-up flex flex-col overflow-hidden"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <Image
                        src={item.thumbnail}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 hover:scale-[1.03]"
                      />
                      <span className="absolute left-2.5 top-2.5 rounded-md border border-border/60 bg-card/90 px-2 py-0.5 text-[11px] font-semibold text-primary backdrop-blur-sm">
                        {item.tag}
                      </span>
                      <span className="absolute bottom-2.5 right-2.5 rounded-md bg-card/90 px-2 py-0.5 text-[11px] text-muted-foreground backdrop-blur-sm">
                        {item.date}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col gap-3 p-4">
                      <div>
                        <p className="truncate font-mono text-[11px] text-muted-foreground">
                          {item.author}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                          {item.title}
                        </h3>
                      </div>

                      {/* Metrics */}
                      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
                        <div className="bg-card px-2.5 py-2">
                          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {item.metricPrimaryLabel}
                          </dt>
                          <dd className="metric-value mt-0.5 text-sm font-bold text-primary">
                            {item.metricPrimaryValue}
                          </dd>
                        </div>
                        <div className="bg-card px-2.5 py-2">
                          <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {item.metricSecondaryLabel}
                          </dt>
                          <dd className="metric-value mt-0.5 text-sm font-bold text-accent-text">
                            {item.metricSecondaryValue}
                          </dd>
                        </div>
                      </dl>

                      {/* Actions */}
                      <div className="mt-auto flex items-center gap-2">
                        <a
                          href={item.targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary inline-flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs"
                        >
                          Mở nền tảng
                          <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                        {item.downloadUrl && (
                          <a
                            href={item.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Tải video gốc không logo"
                            aria-label="Tải video gốc không logo"
                            className="grid size-9 place-items-center rounded-lg border border-border bg-card text-muted-foreground transition-colors duration-200 hover:border-primary hover:text-primary"
                          >
                            <Download className="size-4" aria-hidden="true" />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ------------------------- Modal ------------------------- */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
        >
          <div className="surface animate-fade-up relative w-full max-w-lg p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              aria-label="Đóng"
              className="absolute right-4 top-4 cursor-pointer rounded-lg p-1 text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
            >
              <X className="size-5" aria-hidden="true" />
            </button>

            <h2
              id="qr-modal-title"
              className="text-lg font-bold text-foreground"
            >
              Nạp Xu & Gói Tháng
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              VietQR tự động — hệ thống cộng Xu vào tài khoản sau 5–15 giây kể
              từ khi chuyển khoản.
            </p>

            {/* Plans */}
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "99.000đ",
                  xu: "500 Xu",
                  desc: "Dùng thử KOC",
                },
                {
                  name: "Pro",
                  price: "249.000đ",
                  xu: "1.800 Xu",
                  desc: "Phổ biến nhất",
                  featured: true,
                },
                {
                  name: "Agency",
                  price: "599.000đ",
                  xu: "5.000 Xu",
                  desc: "Chạy Ads & Team",
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-lg border p-3.5 transition-colors duration-200 ${
                    plan.featured
                      ? "border-primary bg-primary/5"
                      : "border-border bg-muted/40 hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-primary">
                      {plan.name}
                    </span>
                    {plan.featured && (
                      <span className="rounded bg-primary-solid px-1.5 py-0.5 text-[9px] font-bold uppercase text-on-primary">
                        Hot
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-lg font-bold text-foreground">
                    {plan.price}
                  </p>
                  <p className="metric-value text-xs font-semibold text-accent-text">
                    {plan.xu}
                  </p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {plan.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* QR */}
            <div className="mt-5 flex items-center gap-4 rounded-lg border border-border bg-muted/40 p-4">
              <div className="grid size-24 shrink-0 place-items-center rounded-lg bg-white p-2 shadow-inner">
                <QrCode
                  className="size-full text-slate-900"
                  aria-hidden="true"
                />
              </div>
              <div className="space-y-1.5 text-xs">
                <p className="flex items-center gap-1.5 font-medium text-primary">
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                  Cổng thanh toán PayOS / SePay
                </p>
                <p className="text-muted-foreground">
                  Nội dung CK:{" "}
                  <strong className="font-mono text-foreground">
                    NAPXU USER102
                  </strong>
                </p>
                <p className="text-muted-foreground">
                  Mở app ngân hàng quét QR để kích hoạt gói ngay.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
