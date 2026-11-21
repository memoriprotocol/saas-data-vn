# DataRadar VN

All-in-One data lookup dashboard cho **TikTok Shop & KOC**, **Douyin**, **YouTube & Shorts**, **Shopee VN**, **Facebook Ads**, **Google Ads** và social (IG/X/FB Page/LinkedIn).

Tra cứu dữ liệu "đang bùng nổ" từ nhiều nền tảng trong một giao diện duy nhất, có tính phí theo lượt quét (Xu) và cache lịch sử miễn phí.

---

## Stack

| Thành phần | Công nghệ |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19 + Tailwind CSS v4 |
| Icons | Lucide React |
| Typography | Fira Sans + Fira Code (Google Fonts) |

---

## Design System

Toàn bộ giao diện được sinh từ skill [`ui-ux-pro-max`](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).

- **Style:** Data-Dense Dashboard (+ Dark Mode OLED cho dark theme)
- **Palette:** Blue data (`#1E40AF`) + Amber accent (`#D97706`)
- **Nguồn chân lý:** [`design-system/dataradar-vn/MASTER.md`](./design-system/dataradar-vn/MASTER.md)

### Token-driven theming

Design token nằm trong [`src/app/globals.css`](./src/app/globals.css) theo pattern `@theme inline` + CSS variables runtime, nên **mọi utility Tailwind resolve đúng theo theme** (light/dark) thay vì bị đóng băng lúc build:

```
@theme inline {
  --color-primary: var(--ds-primary);
  ...
}
:root { --ds-primary: #1e40af; }   /* light */
.dark { --ds-primary: #3b82f6; }   /* dark  */
```

### Accessibility

Đã kiểm chứng bằng script tự động trên cả 2 theme:

- ✅ Contrast text ≥ 4.5:1 (AA) — **0 vi phạm**
- ✅ Focus ring nhìn thấy trên mọi control (`WCAG 2.2`)
- ✅ `prefers-reduced-motion` được tôn trọng
- ✅ Không có horizontal overflow ở 375px
- ✅ Icon decorative dùng `aria-hidden`, icon-only button có `aria-label`
- ✅ Theme toggle dùng `useSyncExternalStore` — không có setState trong effect

---

## Cấu trúc

```
src/
├── app/
│   ├── layout.tsx          # Root layout, Fira fonts, pre-paint theme script
│   ├── page.tsx            # Server Component shell
│   └── globals.css         # Design tokens + component utilities
├── components/
│   └── dashboard/
│       ├── dashboard.tsx   # Client Component (interactive)
│       ├── data.ts         # Platform config + mock data
│       └── types.ts        # Shared types
└── design-system/
    └── dataradar-vn/
        └── MASTER.md       # Design system source of truth
```

---

## Tính năng

- **7 nền tảng** với bộ lọc động theo từng loại (thị trường / thời gian / cách sắp xếp / trạng thái Ads)
- **Hai tầng lọc**
  - *Tầng 1* — gửi kèm API gốc (có tính phí)
  - *Tầng 2* — lọc tức thì trong kết quả đã tải (0 Xu)
- **Cache lịch sử** — tìm lại từ khóa cũ miễn phí 0 Xu
- **Hệ thống Xu** — trừ Xu theo giá nền tảng, tự mở modal nạp khi hết
- **Modal VietQR** — 3 gói Starter / Pro / Agency
- **Light + Dark theme** — tự nhớ lựa chọn, không nháy trắng khi load
- **Responsive** — 375px / 768px / 1024px / 1440px

---

## Chạy local

```bash
npm install
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run start   # serve production build
npm run lint    # ESLint
```

---

## Roadmap

- [ ] Kết nối Backend Proxy thật (`/api/search`) — xem TODO trong `dashboard.tsx`
- [ ] Tích hợp TikHub API cho dữ liệu thật
- [ ] Trang chi tiết / phân tích sâu
- [ ] Deploy Vercel

---

## License

MIT
