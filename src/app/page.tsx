"use client";

import React, { useState, useMemo } from "react";
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
} from "lucide-react";

type PlatformId =
  | "tiktok_shop"
  | "douyin"
  | "youtube"
  | "shopee"
  | "fb_ads"
  | "google_ads"
  | "social_mix";

interface PlatformConfig {
  id: PlatformId;
  name: string;
  badge: string;
  cost: number;
  placeholder: string;
  category: "ecom" | "video" | "ads" | "social";
}

interface ResultItem {
  id: string;
  platform: PlatformId;
  title: string;
  author: string;
  thumbnail: string;
  metricPrimaryLabel: string;
  metricPrimaryValue: string;
  metricPrimaryNum: number;
  metricSecondaryLabel: string;
  metricSecondaryValue: string;
  tag: string;
  date: string;
  targetUrl: string;
  downloadUrl?: string;
}

interface HistoryRecord {
  id: string;
  platform: PlatformId;
  keyword: string;
  filterSummary: string;
  timestamp: string;
  results: ResultItem[];
}

const PLATFORMS: PlatformConfig[] = [
  {
    id: "tiktok_shop",
    name: "TikTok Shop & KOC",
    badge: "1 Xu",
    cost: 1,
    placeholder: "Nhập tên shop, từ khóa sản phẩm hoặc @username KOC...",
    category: "ecom",
  },
  {
    id: "douyin",
    name: "Douyin (TikTok TQ)",
    badge: "1 Xu",
    cost: 1,
    placeholder: "Nhập từ khóa tiếng Việt/Trung hoặc dán link kênh Douyin...",
    category: "video",
  },
  {
    id: "youtube",
    name: "YouTube & Shorts",
    badge: "1 Xu",
    cost: 1,
    placeholder: "Nhập từ khóa tìm video bùng nổ hoặc link video đề xuất...",
    category: "video",
  },
  {
    id: "shopee",
    name: "Shopee VN",
    badge: "2 Xu",
    cost: 2,
    placeholder: "Nhập từ khóa ngành hàng hoặc link gian hàng Shopee...",
    category: "ecom",
  },
  {
    id: "fb_ads",
    name: "Facebook Ads",
    badge: "10 Xu",
    cost: 10,
    placeholder: "Nhập tên Fanpage hoặc từ khóa quảng cáo đối thủ...",
    category: "ads",
  },
  {
    id: "google_ads",
    name: "Google Ads",
    badge: "10 Xu",
    cost: 10,
    placeholder: "Nhập tên miền website (VD: dienmayxanh.com) hoặc thương hiệu...",
    category: "ads",
  },
  {
    id: "social_mix",
    name: "IG / X / FB Page / LinkedIn",
    badge: "2 Xu",
    cost: 2,
    placeholder: "Nhập @username hoặc link trang cá nhân / Fanpage cần quét...",
    category: "social",
  },
];

const MOCK_RESULTS: Record<PlatformId, ResultItem[]> = {
  tiktok_shop: [
    {
      id: "tt-1",
      platform: "tiktok_shop",
      title: "Áo khoác kaki 2 lớp form rộng chống gió kèm video gắn giỏ hàng",
      author: "@thanhdongian.dtt",
      thumbnail:
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80",
      metricPrimaryLabel: "Đã bán",
      metricPrimaryValue: "14.200 đơn",
      metricPrimaryNum: 14200,
      metricSecondaryLabel: "View Video",
      metricSecondaryValue: "482.5K",
      tag: "Mall • Có Video Ad",
      date: "2 ngày trước",
      targetUrl: "https://www.tiktok.com",
      downloadUrl: "https://www.tiktok.com",
    },
    {
      id: "tt-2",
      platform: "tiktok_shop",
      title: "Set bình giữ nhiệt inox 316 hiển thị nhiệt độ 1000ml",
      author: "@giadungnhaxinh.vn",
      thumbnail:
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80",
      metricPrimaryLabel: "Đã bán",
      metricPrimaryValue: "8.950 đơn",
      metricPrimaryNum: 8950,
      metricSecondaryLabel: "View Video",
      metricSecondaryValue: "215.0K",
      tag: "Shop Yêu Thích",
      date: "5 ngày trước",
      targetUrl: "https://www.tiktok.com",
      downloadUrl: "https://www.tiktok.com",
    },
    {
      id: "tt-3",
      platform: "tiktok_shop",
      title: "Đèn ngủ cảm biến chuyển động sạc USB gắn tường thông minh",
      author: "@decorphongngu99",
      thumbnail:
        "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&q=80",
      metricPrimaryLabel: "Đã bán",
      metricPrimaryValue: "3.410 đơn",
      metricPrimaryNum: 3410,
      metricSecondaryLabel: "View Video",
      metricSecondaryValue: "96.4K",
      tag: "Đang lên xu hướng",
      date: "Hôm nay",
      targetUrl: "https://www.tiktok.com",
      downloadUrl: "https://www.tiktok.com",
    },
  ],
  douyin: [
    {
      id: "dy-1",
      platform: "douyin",
      title: "Kệ gia vị xoay 360 độ thông minh (Tự động dịch từ khóa VN → CN)",
      author: "家居好物精选 (Douyin)",
      thumbnail:
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&q=80",
      metricPrimaryLabel: "Lượt tim",
      metricPrimaryValue: "328.4K tim",
      metricPrimaryNum: 328400,
      metricSecondaryLabel: "Tỷ lệ xem hết",
      metricSecondaryValue: "68.5%",
      tag: "Kênh nhỏ bùng nổ",
      date: "3 ngày trước",
      targetUrl: "https://www.douyin.com",
      downloadUrl: "https://www.douyin.com",
    },
  ],
  youtube: [
    {
      id: "yt-1",
      platform: "youtube",
      title: "Review chi tiết top 5 phụ kiện bàn làm việc tối giản đáng mua nhất",
      author: "Tech Setup VN (4.2K Sub)",
      thumbnail:
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400&q=80",
      metricPrimaryLabel: "Lượt xem",
      metricPrimaryValue: "312.000 view",
      metricPrimaryNum: 312000,
      metricSecondaryLabel: "Outlier Score",
      metricSecondaryValue: "74.2x Sub",
      tag: "Key bùng nổ 7 ngày",
      date: "4 ngày trước",
      targetUrl: "https://www.youtube.com",
    },
  ],
  shopee: [
    {
      id: "sp-1",
      platform: "shopee",
      title: "Quần ống rộng nữ cạp cao chất tuyết mưa không nhăn",
      author: "Thoitrangnu.official",
      thumbnail:
        "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80",
      metricPrimaryLabel: "Đã bán",
      metricPrimaryValue: "29.400 đơn",
      metricPrimaryNum: 29400,
      metricSecondaryLabel: "Đánh giá",
      metricSecondaryValue: "4.9 ★ (6.1K)",
      tag: "Shopee Mall • Nội địa",
      date: "Cập nhật hôm nay",
      targetUrl: "https://shopee.vn",
    },
  ],
  fb_ads: [
    {
      id: "fb-1",
      platform: "fb_ads",
      title:
        "Mẫu Ads: Giảm 40% combo chăm sóc da ban đêm - Miễn phí vận chuyển toàn quốc",
      author: "Fanpage: Derma Care Vietnam",
      thumbnail:
        "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80",
      metricPrimaryLabel: "Trạng thái",
      metricPrimaryValue: "Đang chạy (18 ngày)",
      metricPrimaryNum: 18,
      metricSecondaryLabel: "Định dạng",
      metricSecondaryValue: "Video 1:1",
      tag: "Active • VN",
      date: "Bắt đầu 03/11",
      targetUrl: "https://www.facebook.com/ads/library",
    },
  ],
  google_ads: [
    {
      id: "gg-1",
      platform: "google_ads",
      title: "Quảng cáo Search & Shopping: Phần mềm quản lý bán hàng đa kênh",
      author: "Domain: sapo.vn",
      thumbnail:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&q=80",
      metricPrimaryLabel: "Số mẫu Ads",
      metricPrimaryValue: "42 mẫu hoạt động",
      metricPrimaryNum: 42,
      metricSecondaryLabel: "Kênh hiển thị",
      metricSecondaryValue: "Search + YouTube",
      tag: "Google Transparency",
      date: "Cập nhật hôm nay",
      targetUrl: "https://adstransparency.google.com",
    },
  ],
  social_mix: [
    {
      id: "sm-1",
      platform: "social_mix",
      title: "Tổng hợp bài đăng tương tác cao nhất 30 ngày gần đây",
      author: "@creator.vietnam",
      thumbnail:
        "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&q=80",
      metricPrimaryLabel: "Tương tác",
      metricPrimaryValue: "45.8K lượt",
      metricPrimaryNum: 45800,
      metricSecondaryLabel: "Nền tảng",
      metricSecondaryValue: "Instagram / Threads",
      tag: "Hồ sơ công khai",
      date: "Hôm nay",
      targetUrl: "https://www.instagram.com",
    },
  ],
};

export default function DashboardPage() {
  const [selectedPlatform, setSelectedPlatform] =
    useState<PlatformId>("tiktok_shop");
  const [query, setQuery] = useState("");
  const [credits, setCredits] = useState<number>(120);
  const [loading, setLoading] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

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
    () => PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0],
    [selectedPlatform]
  );

  // Chuyển tab nền tảng
  const handleSwitchPlatform = (platformId: PlatformId) => {
    setSelectedPlatform(platformId);
    setQuickFilterText("");
    setMinMetric(0);
    setResults(MOCK_RESULTS[platformId] || []);
    setActiveSourceNote("Sẵn sàng tra cứu");
  };

  // Nút tìm kiếm duy nhất
  const handleSearch = async (e: React.FormEvent) => {
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

      const baseItems = MOCK_RESULTS[selectedPlatform] || [];
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
  };

  // Mở lại từ Lịch sử tìm kiếm (0 Xu)
  const handleLoadHistory = (record: HistoryRecord) => {
    setSelectedPlatform(record.platform);
    setQuery(record.keyword);
    setResults(record.results);
    setQuickFilterText("");
    setMinMetric(0);
    setActiveSourceNote("Mở từ Lịch sử đã lưu (Miễn phí 0 Xu)");
  };

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              D
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">
                DataRadar VN
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                All-in-One
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-amber-300">
                {credits} Xu
              </span>
            </div>
            <button
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              <span>Nạp gói VietQR</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="max-w-7xl w-full mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Sidebar: Lịch sử tìm kiếm */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-semibold text-sm text-slate-200">
                <History className="w-4 h-4 text-indigo-400" />
                <span>Lịch sử đã quét</span>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                Xem lại 0 Xu
              </span>
            </div>

            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {history.map((item) => {
                const pName =
                  PLATFORMS.find((p) => p.id === item.platform)?.name ||
                  item.platform;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleLoadHistory(item)}
                    className="w-full text-left p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition group cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                      <span className="font-medium text-indigo-400 truncate max-w-[140px]">
                        {pName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-slate-100 truncate group-hover:text-white">
                      {item.keyword}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {item.filterSummary}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-9 space-y-5">
          {/* Thanh chọn nền tảng */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex flex-wrap gap-1.5">
            {PLATFORMS.map((platform) => {
              const active = platform.id === selectedPlatform;
              return (
                <button
                  key={platform.id}
                  onClick={() => handleSwitchPlatform(platform.id)}
                  className={`px-3.5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition cursor-pointer ${
                    active
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  {platform.category === "ecom" && (
                    <ShoppingBag className="w-4 h-4" />
                  )}
                  {platform.category === "video" && (
                    <Video className="w-4 h-4" />
                  )}
                  {platform.category === "ads" && (
                    <Megaphone className="w-4 h-4" />
                  )}
                  {platform.category === "social" && (
                    <Globe className="w-4 h-4" />
                  )}
                  <span>{platform.name}</span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded-md ${
                      active
                        ? "bg-indigo-700 text-indigo-100"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {platform.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Khung tìm kiếm 1 ô + 1 nút + Bộ lọc Tầng 1 */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={currentPlatformConfig.placeholder}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:outline-none text-sm text-white placeholder:text-slate-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-semibold text-sm text-white flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{loading ? "Đang quét..." : "Tìm kiếm ngay"}</span>
              </button>
            </form>

            {/* Bộ lọc động theo từng nền tảng (Tầng 1 - Gửi vào API) */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                Bộ lọc quét:
              </span>

              {(selectedPlatform === "tiktok_shop" ||
                selectedPlatform === "shopee") && (
                <>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="VN">Thị trường: Việt Nam (VN)</option>
                    <option value="TH">Thị trường: Thái Lan (TH)</option>
                    <option value="US">Thị trường: Mỹ (US)</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
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
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="7d">Thời gian: 7 ngày gần nhất</option>
                    <option value="15d">Thời gian: 15 ngày gần nhất</option>
                    <option value="30d">Thời gian: 30 ngày gần nhất</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
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
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="VN">Quốc gia Ads: Việt Nam</option>
                    <option value="ALL">Quốc gia Ads: Toàn cầu</option>
                  </select>
                  <select
                    value={adStatus}
                    onChange={(e) => setAdStatus(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                  >
                    <option value="ACTIVE">
                      Trạng thái: Đang chạy (Active)
                    </option>
                    <option value="ALL">Tất cả mẫu quảng cáo</option>
                  </select>
                </>
              )}
            </div>
          </div>

          {/* Thanh lọc nhanh Tầng 2 (Chạy tức thì trên trình duyệt = 0 Xu) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>
                Hiển thị <strong>{filteredResults.length}</strong> kết quả •{" "}
                <span className="text-indigo-400">{activeSourceNote}</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={quickFilterText}
                onChange={(e) => setQuickFilterText(e.target.value)}
                placeholder="Lọc nhanh trong kết quả (0 Xu)..."
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <select
                value={minMetric}
                onChange={(e) => setMinMetric(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-slate-200"
              >
                <option value={0}>Mọi mức chỉ số</option>
                <option value={1000}>Chỉ số từ 1.000 trở lên</option>
                <option value={10000}>Chỉ số từ 10.000 trở lên</option>
                <option value={100000}>Chỉ số từ 100.000 trở lên</option>
              </select>
            </div>
          </div>

          {/* Danh sách thẻ kết quả */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredResults.map((item) => (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden flex flex-col transition"
              >
                <div className="relative h-44 bg-slate-800">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-950/85 text-indigo-300 border border-slate-700/80">
                    {item.tag}
                  </span>
                  <span className="absolute bottom-2.5 right-2.5 text-xs px-2 py-0.5 rounded bg-slate-950/80 text-slate-300">
                    {item.date}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1 truncate">
                      {item.author}
                    </div>
                    <h3 className="font-semibold text-sm text-slate-100 line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div>
                        <div className="text-[11px] text-slate-400">
                          {item.metricPrimaryLabel}
                        </div>
                        <div className="text-sm font-bold text-emerald-400">
                          {item.metricPrimaryValue}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] text-slate-400">
                          {item.metricSecondaryLabel}
                        </div>
                        <div className="text-sm font-bold text-amber-300">
                          {item.metricSecondaryValue}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={item.targetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition"
                      >
                        <span>Mở trên nền tảng</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                      {item.downloadUrl && (
                        <a
                          href={item.downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Tải video gốc không logo"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modal Nạp Gói VietQR */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-5 relative">
            <button
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h2 className="text-lg font-bold text-white">
                Nạp Xu & Gói Tháng (VietQR Tự Động)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Hệ thống tự động cộng Xu vào tài khoản sau 5–15 giây kể từ khi
                chuyển khoản.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  name: "Gói Starter",
                  price: "99.000đ",
                  xu: "500 Xu",
                  desc: "Dùng thử KOC",
                },
                {
                  name: "Gói Pro",
                  price: "249.000đ",
                  xu: "1.800 Xu",
                  desc: "Phổ biến nhất",
                },
                {
                  name: "Gói Agency",
                  price: "599.000đ",
                  xu: "5.000 Xu",
                  desc: "Chạy Ads & Team",
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500 transition space-y-1.5"
                >
                  <div className="text-xs text-indigo-400 font-semibold">
                    {plan.name}
                  </div>
                  <div className="text-base font-bold text-white">{plan.price}</div>
                  <div className="text-xs font-medium text-amber-400">
                    {plan.xu}
                  </div>
                  <div className="text-[11px] text-slate-500">{plan.desc}</div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg bg-white p-2 flex items-center justify-center shrink-0">
                <QrCode className="w-full h-full text-slate-900" />
              </div>
              <div className="text-xs space-y-1.5 text-slate-300">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cổng thanh toán PayOS / SePay</span>
                </div>
                <p>
                  Nội dung chuyển khoản tự động:{" "}
                  <strong className="text-white">NAPXU USER102</strong>
                </p>
                <p className="text-slate-500">
                  Mở app ngân hàng bất kỳ quét mã QR để kích hoạt gói ngay lập
                  tức.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
