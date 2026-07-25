# Goal & Habit Tracker — 全程式 UX 審視（更新至 v0.42.1）

## v0.44.4-test Today IA
- 移除 Focus／清單雙模式及三項自動推薦，降低今日決策負擔。
- Garden 與行程維持摘要層級；今日任務直接操作；全部任務預設收合。

## v0.42.10-test 穩定面板決定
- 恢復固定 TimeBlocks 式 Sheet、固定名稱區及詳細資料內部捲動。
- iOS Input Assistant 視為系統鍵盤介面；不再以更換 textarea、contenteditable 或 ARIA 屬性作規避。

## v0.42.9-test 對照診斷
- 暫時接受鍵盤出現時較高的 Sheet，以換取與 v0.42.4 完全一致的輸入環境。
- 真機只需先判斷五種名稱欄的「上一個／下一個／完成」工具列是否消失。

## v0.42.8-test iOS Input Assistant 診斷
- 名稱欄保留 aria-label，但暫時移除 role、aria-multiline、inputmode、enterkeyhint、autocapitalize 及 spellcheck。
- 主面板、內部捲動、背景 Bridge、簡約所屬位置與完整路徑不變。
- 真機驗收重點是五種名稱欄的 Input Assistant 是否全部消失。

## v0.42.7-test 純文字輸入與資訊密度
- 名稱欄保留 textbox role、aria-label、inputmode 及 enterkeyhint，但不含表單 `name`／`autocomplete`。
- 主摘要縮短為目標名稱，完整路徑於第二層呈現。
- Bridge 由 Sheet 底部連續延伸，避免鍵盤配件區背景截斷。
- iOS Input Assistant 是否消失仍須真機 Safari 驗證。

## 範圍

本輪檢查 `今日`、`目標`、`日程`、`花園`、`更多／設定` 五個主要頁面，以及目前的排程面板、確認流程、資料保存及備份入口。專案仍以單一自包含 `index.html` 作為互動原型 source of truth。

## 已確認正常

- 五個主要頁面在 390 × 844 viewport 均沒有水平 overflow。
- 掃描時沒有重複 DOM ID。
- 今日、目標、日程及花園主頁沒有未命名的可見表單控制。
- 日程頁 global FAB 已移除，頁內仍保留「加入時段」、空檔加入及待安排入口。
- 排程面板的月曆、時間、時長、重複範圍及確認流程已使用同一持續存在的 sheet。
- Schema 8、`ght_state_blank`、單一 HTML 及無 build 依賴維持不變。

## 優化優先次序

### 已完成 — 設定頁觸控與無障礙（v0.35.0）

自動掃描在設定頁發現 51 個可見控制，其中 32 個至少一邊小於 44px；16 個原生時間輸入沒有可讀名稱，另有 3 個可見原生 select。

v0.35.0 已完成：

- 設定首頁改為七個摘要入口。
- 每週可用時間改成逐日展開，避免同時顯示 16 個時間輸入。
- 開始／結束時間改用具名直接列及 inline wheel。
- 專注偏好不再使用原生 select。
- 設定首頁及所有子頁的可見控制均達 44px，沒有未命名控制。

### 已完成 — 全程式主要觸控區（v0.36.0）

掃描仍找到：

- 今日頁 2 個 40px 高分段按鈕。
- 目標頁新增按鈕為 40 × 40px。
- 日程頁 4 個 30–40px 控制，包括今日／本週及局部加入按鈕。
- 花園頁 5 個 28–34px 控制。

v0.36.0 已將今日分段、目標新增、日程切換／局部加入，以及花園返回／日夜／分段控制提升至至少 44 × 44px。五個主頁的 UI audit smallCount 現時全部為 0。

### 已完成 — 目標／任務／習慣／層級面板一致性（v0.37.0–v0.40.0）

任務、習慣、目標、專案及階段均已改用一致的直接式底部面板。新增使用單剔；編輯依內容語意保存或關閉；日期、時間及重複規則沿用 inline 控制。資料關聯及歷史完成紀錄由相應 smoke tests 保護。

### 已完成 — 設定資訊架構（v0.35.0）

更多／設定頁已改為七個摘要入口及對應子頁，包括每週可用時間、專注與休息、提醒與回顧、顯示與規劃、外部日曆、活動歷史、資料與備份。設定首頁只顯示摘要及目前值，時間控制使用具名 inline wheel；可見控制均達 44px。

### P2 — 資料保存與大型資料量

v0.42.0 已加入 localStorage quota failure 可見警告及大型資料 fixture；自動化環境中的同步 render 仍在原型預算內。但 `render()` 與 persistence 尚未分離，真實長期資料、拖拉／滾輪期間的寫入成本及低效能裝置表現仍未驗證。

後續只應在有實測問題證據時考慮 debounce 或保存時機調整，並維持 Schema 8 與既有 storage key。

### P2 — 匯入資料完整性

v0.42.0 已完成 5 MB 限制、future-schema rejection、主要巢狀資料形狀驗證、程式內確認、交易式取代及 rollback。malformed、future-schema 與 quota failure 不會覆寫目前資料。

仍可在有真實匯入問題證據時評估：

- 重複 ID 檢查。
- task／session／exception 關聯存在性。
- 日期、時間及分鐘數範圍。
- 複雜錯誤的分項說明。

### P3 — 文案一致性

介面仍混合書面中文、廣東話及「今週／本週」等詞彙。建議建立小型 copy dictionary，統一：

- 本週／今週
- 沒有／未有／冇
- 日程／排程／安排
- 完成／打卡

### P3 — 真機與輔助技術驗證

目前自動化已覆蓋主要資料與 DOM 行為，但仍需真機驗證：

- iPhone Safari／Android Chrome 觸控慣性。
- Visual Viewport、鍵盤及 safe area。
- VoiceOver／TalkBack 閱讀次序。
- reduced motion 與高對比模式。
- 大型資料集下的 render／拖拉效能。

## 建議下一輪

v0.42.0 已完成 320–430px viewport matrix、reduced motion、匯入交易安全、quota 警告及大型 fixture 自動測試。下一階段應以系統字體放大、VoiceOver／TalkBack、iOS／Android 鍵盤與 safe area、Android 返回鍵及真機拖拉手感為主；在收到具體使用回饋前凍結大範圍 UI 架構。


## v0.42.5-test 真機互動修正
- 430 × 932 視覺檢查確認底部導航高度與上方留白回復舒適比例。
- 鍵盤狀態下 Sheet 頂部保持固定，名稱可見，詳細資料只在 Sheet 內捲動。
- 本週日期 Rail 使用 44px 以上日期按鈕，避開畫面最右邊的系統手勢區，且與垂直日期區塊提供雙重高亮。
- 自動化 UI audit：五個主頁均無水平 overflow、過小控制、未命名控制、重複 ID 或原生 select。
- 仍須以 iPhone Safari 及加入主畫面模式驗證真實鍵盤高度、右側 Rail 手感與邊緣自動捲動速度。


## v0.42.6-test iOS 輸入回歸檢查
- 五個名稱欄均為單一 textarea，並位於詳細資料 scroll container 之外。
- 固定名稱區與詳細資料區沒有重疊；捲動詳細資料不會移動名稱。
- 鍵盤背景 Bridge 為純視覺層，不接受點按、不改變內容高度。
- Chromium 只能驗證 DOM、viewport 與背景結構；Input Assistant 是否消失必須以 iPhone Safari 真機確認。
