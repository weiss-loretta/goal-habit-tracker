# FUTURE_ARCHITECTURE.md — 正式版目標架構

> 本文件是未來方向，不代表目前已實作功能。正式開發應在 v1 IA 核心流程確認後才開始。

## 目標技術棧
- Vite
- React 18+
- TypeScript strict mode
- 組件化 UI
- 獨立 domain model、storage layer 與 migrations
- 自動測試與 production build
- 視需要加入 PWA、通知及雲端同步

## 建議資料夾
```text
src/
├── app/
├── components/
├── features/
│   ├── today/
│   ├── goals/
│   ├── timeline/
│   └── garden/
├── domain/
├── storage/
├── migrations/
└── tests/
```

## 正式開發前的 IA 門檻
- 確定底部導航與每頁責任
- 確定 Goal／Project／Milestone／Task／Habit／Session 關係
- 驗證「目標 → 今日行動 → 安排 → 完成 → 花園回饋」
- 測試空白、一般及較多資料狀態
- 凍結 v1 功能範圍與主要文案

## 遷移原則
- 現有 `index.html` 是互動參考，不應逐行搬入 React。
- 先定義 domain types 與 migration，再拆分 UI。
- 每次只遷移一條完整流程，並保留可驗證的 acceptance criteria。
