# Changelog

## v0.42.1 — Phase 3.38 iOS Interaction Stability

### Fixed
- 固定 App shell 於 visual viewport，移除 Safari 外層文件第二重捲動。
- 修正慢速捲動誤啟動任務長按、拖拉時文字選取、放手誤開編輯器及習慣不可排序。
- 修正所有統一編輯器在更改設定時完整退出再滑入，以及 MutationObserver 反覆搶走中文輸入焦點。
- 日程拖拉自動捲動改為內頁 scroll container；空日程仍保留完整 drop targets。
- 目標總覽加入 render error 安全 fallback，避免低頻錯誤只顯示空白頁。

### Validation
- 新增 `smoke:phase-338`，覆蓋固定 viewport、外層捲動鎖定、500ms 長按進度、移動取消、習慣排序、穩定 editor identity、清空後重新輸入、目標頁 fallback 及空日程 drop targets。
- Schema 維持 7，未改變 Goal／Project／Milestone／Task、Session、Habit、Garden、排程重疊或備份語意。

## v0.42.0 — Phase 3.37 Release Hardening

### Changed
- 調整極窄畫面的頁邊、分段控制及面板間距，並改善長名稱換行。
- 全域加入 `prefers-reduced-motion: reduce`，關閉非必要動畫、轉場及平滑捲動。
- 備份匯入改用程式內確認，不再依賴原生 `confirm()`。
- 匯入流程先完整驗證，再以交易方式取代 state；migration 或 localStorage 寫入失敗時回復匯入前資料。
- localStorage quota failure 改為可見警告，不再靜默忽略。

### Validation
- 匯入檔案上限維持 5 MB，並驗證 JSON、根資料類型及 `CURRENT_SCHEMA`。
- 拒絕高於 Schema 7 的 future schema。
- 驗證 goals、projects、milestones、tasks、routines、sessions、timeBlocks、events、settings、dailyPlans 及 garden 的必要資料形狀。
- malformed、future-schema 及 quota failure 均不得覆寫目前資料；成功與失敗均顯示明確狀態。

### Tests
- 新增 `smoke:phase-337`，覆蓋五個主頁的 320 × 568、375 × 667、390 × 844、430 × 932 viewport matrix。
- 驗證長名稱編輯器、reduced motion、交易式匯入、程式內確認、quota rollback 及大型資料 fixture。
- 大型 fixture 包含 20 個目標、100 個專案、500 個階段及 200 個任務。
- `check`、schema 7、timeline、Phase 3.10B／3.10C、Phase 3.11C–3.37、`audit:ui` 及 ZIP 完整性檢查通過。

## v0.41.0 — Phase 3.36 Modal Lifecycle, Validation & Discard Safety

### Changed
- 統一新增面板的名稱必填驗證及建立按鈕 enabled／disabled 狀態。
- 加入 inline 錯誤、aria-invalid 及錯誤訊息關聯。
- 已修改草稿離開時顯示持久面板內確認，可繼續修改或捨棄草稿。
- 新增面板的關閉按鈕、背景點按及 Escape 使用相同離開規則。
- 編輯既有內容按 Escape 時依各面板原有語意保存。
- 一般 modal 自動取得 dialog、aria-modal、aria-labelledby 及初始焦點。
- Tab 焦點限制於最上層 dialog 或草稿 alertdialog。
- 關閉 modal 後將焦點返回原觸發控制。
- 一般 modal 表單、批次及確認控制提升至至少 44px。

### Accessibility
- 草稿確認顯示時，後方編輯內容以 aria-hidden 隱藏。
- Escape 在草稿確認中會返回編輯，而不是直接關閉整個面板。
- 代表性輔助面板通過 320 × 568 無水平溢出檢查。
- 主頁 audit 繼續維持五頁 smallCount、unnamedCount、水平 overflow 及重複 ID 為 0。

### Tests
- 新增 `smoke:phase-336`，驗證必填錯誤、建立狀態、草稿保護、alertdialog、焦點限制、Escape 語意、焦點返回、44px 及 320px 溢出。
- `check`、schema 7、timeline 及 Phase 3.10C–3.36 完整回歸通過。

## v0.40.0 — Phase 3.35 Unified Project & Milestone Editors

### Changed
- 統一專案及階段的新增／編輯底部面板。
- 移除舊式通用表單、編輯對話框及底部取消／儲存列。
- 新增使用右上角單剔；編輯關閉時保存並提供右上角刪除。
- 專案及階段名稱改為大型主要輸入。
- 父層目標／專案以平面資訊列顯示，避免編輯時意外搬移層級。
- 截止日改用 inline 月曆，可直接清除日期與提醒。
- 階段總預計時間改用直接選項。
- 專案標題改為可直接點按編輯。

### Data integrity
- 編輯專案保留 milestones 及所有 task pid／mid 關聯。
- 編輯階段保留 done、subtasks 及所有 task mid 關聯。
- 刪除仍沿用既有確認、關聯修復及任務移回零散任務流程。

### Tests
- 新增 `smoke:phase-335`，驗證專案／階段新增、編輯、日期、提醒、預計時間、關閉保存及所有子資料與關聯保留。
- `check`、schema 7、timeline 及 Phase 3.10C–3.35 完整回歸通過。

## v0.39.0 — Phase 3.34 Unified Goal Editor

### Changed
- 統一新增及編輯目標的直接式底部面板。
- 移除舊式通用表單與底部取消／儲存列，改用單一 handle 及線性頂部操作。
- 新增目標右上角以單剔建立；編輯目標關閉時保存並提供右上角刪除。
- 目標名稱改為大型主要輸入。
- 達成型／持續型改為直接選擇，不再使用原生 select。
- 顏色控制提升至 44px 並加入可讀名稱。
- 目標日期改用 inline 月曆，可直接清除日期及提醒。
- 「為何而做」改為多行文字區。

### Data integrity
- 編輯目標只更新名稱、類型、顏色、日期、提醒及初心。
- 保留目標狀態、焦點、專案、任務、習慣及所有子資料。
- 「先建立目標」再返回任務／習慣的流程維持不變。

### Tests
- 新增 `smoke:phase-334`，驗證新增／編輯共用樣式、單一 handle、類型、顏色、inline 月曆、提醒、初心、關閉保存及子資料保留。
- `check`、schema 7、timeline 及 Phase 3.10C–3.34 完整回歸通過。

## v0.38.0 — Phase 3.33 Unified Habit Editor

### Changed
- 統一新增及編輯習慣的直接式底部面板。
- 移除舊式通用表單與四欄編輯對話框，改用單一 handle 及線性頂部操作。
- 新增習慣右上角以單剔建立；編輯習慣關閉時保存並提供右上角刪除。
- 習慣名稱改為大型主要輸入。
- 重複規則保留簡易轉輪及完整自訂模式，並以同一面板展開。
- 每次預計時間改用直接選項；預設時間改用 inline hour/minute wheel。
- 每次提醒改為平面資訊列。
- 編輯習慣時保留原 recurrence start 及 completionDates。

### Accessibility
- 建立、關閉、刪除、預設時間及清除時間操作均有明確可讀名稱。
- 非轉輪控制均達至少 44px；日期 chips 及自訂規則 stepper 同步擴大。
- 主頁 audit 持續維持五頁 smallCount、unnamedCount、水平 overflow 及重複 ID 為 0。

### Tests
- 新增 `smoke:phase-333`，驗證新增／編輯共用樣式、自訂週期、多選星期、每次時長、時間轉輪、提醒、關閉保存及完成歷史保留。
- 更新 Phase 3.10C FAB「設為習慣」測試以配合右上角單剔。
- `check`、schema 7、timeline 及 Phase 3.10C–3.33 完整回歸通過。

## v0.37.0 — Phase 3.32 Unified Task Editor

### Changed
- 統一新增及編輯任務的底部面板排版與操作語言。
- 移除傳統標題及底部取消／儲存列，改為單一 handle 與線性頂部操作。
- 新增任務右上角以單剔建立；編輯任務關閉時保存並提供右上角刪除。
- 任務名稱改為大型主要輸入。
- 截止日改用 inline 月曆；總預計時間改用直接選項；完成次數改用 stepper。
- 目標、專案、階段及提醒改用平面分隔列呈現。
- 編輯任務時同步保存提醒設定。

### Accessibility
- 任務面板的建立、關閉、刪除、日期、預計時間及完成次數控制均有可讀名稱或可見文字。
- 可見任務面板控制均達至少 44px。
- 維持主頁 audit：五頁 smallCount、unnamedCount、水平 overflow 及重複 ID 均為 0。

### Tests
- 新增 `smoke:phase-332`，驗證新增／編輯共用樣式、單一 handle、inline 月曆、預計時間、完成次數、關閉保存及 44px 控制。
- 更新 Phase 3.10C FAB 任務新增測試以配合右上角單剔操作。
- `check`、schema 7、timeline 及 Phase 3.10C–3.32 完整回歸通過。

## v0.36.0 — Phase 3.31 Primary Touch Targets

### Changed
- 今日焦點／清單分段、目標新增、日程切換與局部加入控制提升至至少 44px。
- 花園返回、日夜切換及三個分段控制提升至至少 44px。
- 花園返回與日夜切換加入明確 aria-label。
- 同步擴大週導航、建議完成、目標狀態、階段新增及任務安排等常用控制。
- 視覺字體及圖示比例維持不變，主要增加實際點按區。

### Audit
- 今日 smallCount `2 → 0`。
- 目標 smallCount `1 → 0`。
- 日程 smallCount `4 → 0`。
- 花園 smallCount `5 → 0`。
- 設定維持 smallCount `0`。
- 五頁 unnamedCount、水平 overflow 及重複 ID 均為 0。

### Tests
- 新增 `smoke:phase-331`，逐頁驗證可見主要控制的 44px、可讀名稱、Timeline FAB 隱藏及頁內加入入口。
- `check`、schema 7、timeline 及 Phase 3.10C–3.31 完整回歸通過。

## v0.35.0 — Phase 3.30 Layered Settings & Direct Time Controls

### Changed
- 將單一長設定頁改為七個摘要入口及對應子頁。
- 每週可用時間改成逐日展開，避免一次顯示所有時間控制。
- 可用時間與早／晚回顧時間改用 inline hour/minute wheels。
- 可用時間開始值變更時保留原時長，結束值不得早於開始值。
- 專注與休息的三個原生 select 改為同層選項清單。
- 外部日曆顯示改為完整列 switch；資料及活動歷史移至獨立子頁。
- 設定子頁返回時回到設定首頁，不會離開設定頁。

### Accessibility
- 設定首頁及所有子頁的���見控制均達至少 44px。
- 移除設定頁可見的原生 time input 與 select。
- 可用時間及回顧時間按鈕加入明確可讀名稱及展開狀態。
- UI audit：設定頁 small controls `32 → 0`，unnamed controls `16 → 0`，visible native selects `3 → 0`。

### Tests
- 新增 `smoke:phase-330`，驗證分層設定、逐日展開、時間滾輪、時長保留、專注選項及所有設定子頁的 44px／命名要求。
- 更新 Phase 3.11C 備份入口測試以符合分層設定。
- `check`、schema 7、timeline 及 Phase 3.10C–3.30 完整回歸通過。

## v0.34.1 — Phase 3.29 Timeline FAB Removal & UX Audit

### Changed
- Timeline 頁直接隱藏 global FAB，頁內新增時段入口維持不變。
- 新增 `audit:ui` 自動掃描及 `UX_AUDIT.md` 全程式優化清單。

### Audit
- 五個主頁在 390 × 844 viewport 沒有水平 overflow 或重複 ID。
- 設定頁發現 32 個至少一邊小於 44px 的控制、16 個未命名時間輸入及 3 個可見原生 select。
- 後續優先次序為設定頁、全程式觸控區、目標／任務／習慣面板一致性、保存效能及匯入完整性。

### Tests
- 新增 `smoke:phase-329`，驗證 Timeline 隱藏 global FAB，其他頁面的既有顯示規則不變，並保留頁內加入入口。
- `check`、schema 7、timeline 及 Phase 3.10C–3.29 完整回歸通過。

## v0.34.0 — Phase 3.28 Recurrence Clarity & Exception Management

### Changed
- 每週重複摘要改為顯示實際星期，例如「每週一／每週三」。
- 選擇每週規則或明確更改日期時，星期會與面板日期同步。
- 重複固定時段的 repeat 展開區加入開始日期及結束模式。
- 結束模式支援「永不結束」及「指定日期」，指定日期採包含當日語意。
- 系列開始及結束日期沿用自訂 inline calendar，不離開目前排程面板。
- 開啟具有單日 override 的固定時段時，草稿會載入該次實際名稱及時間。
- 面板加入單日例外摘要與「恢復系列設定」，可單獨移除目前日期的 override／skip。

### Tests
- 新增 `smoke:phase-328`，驗證每週星期摘要、日期同步、開始／結束範圍、包含式結束日期、例外載入及恢復。
- 更新既有每週選項測試，使其驗證具體星期標籤。
- `check`、schema 7、timeline 及 Phase 3.10C–3.28 完整回歸通過。

## v0.33.0 — Phase 3.27 Single Handle & Persistent Confirmations

### Fixed
- 停用直接排程面板繼承自 `.modal::before` 的裝飾 handle，修正頂部同時出現兩個 handle 的問題。
- 只保留可啟動下滑關閉的實際 `.directhandle`。

### Changed
- 重複時段修改範圍、刪除範圍與新草稿放棄確認改為原面板內的確認層。
- 確認流程不再替換整個 modal root，也不會建立第二個面板或重播滑入動畫。
- 返回／取消後保留同一面板節點、草稿內容及編輯位置。
- 確認層加入 alert-dialog 語意與焦點移動，背景表單在確認期間設為 aria-hidden。

### Tests
- 新增 `smoke:phase-327`，驗證只顯示一個 handle、舊 pseudo handle 已隱藏，以及三種確認流程均保留同一面板外殼。
- `check`、schema 7、timeline 及 Phase 3.10C–3.27 完整回歸通過。

## v0.31.0 — Phase 3.25 Planner Input Refinement

### Changed
- 以同層直接任務選擇器取代新增專注時段的原生 select。
- 任務選擇器加入搜尋、目標色點、所屬目標與尚餘時間，選取任務時不重建排程面板外殼。
- 滾輪選項改為可點按控制；非中央項目會平滑移至中央並提交選取。
- 捲動期間即時更新中央選項樣式，停止後才更新資料，並加入 scroll-end 提交與同值防重複更新。
- 滾輪加入垂直 touch-action、overscroll 隔離及低調選中縮放，減少面板捲動搶手勢。
- 名稱與任務搜尋加入行動鍵盤協調；名稱獲焦時局部收起展開編輯器，Enter／完成只關閉鍵盤。
- 面板高度跟隨 Visual Viewport，降低軟鍵盤出現時的跳動。

### Tests
- 新增 `smoke:phase-325`，驗證直接任務選擇、搜尋、尚餘時間、點按滾輪選項及鍵盤狀態。
- `check`、schema 7、timeline 及 Phase 3.10C–3.25 完整回歸通過。

## v0.30.2 — Phase 3.24 Editable Current Duration

### Changed
- 「本次時間」改為可點按欄位，點按後在同一面板展開單欄時長滾輪。
- 時長滾輪沿用原有常用時長選項，無須返回開始／結束時間滾輪才能更改本次時長。
- 調整本次時間時，即時同步結束時間、已安排時間及安排進度條。
- 保留持續存在的面板外殼，展開及操作時長滾輪不會令面板重新滑入。

### Tests
- 新增 `smoke:phase-324`，驗證本次時間可開啟滾輪、修改分鐘數、更新結束時間與工時摘要，並維持同一面板節點。
- `check`、schema 7、timeline 及 Phase 3.10C–3.24 全部回歸通過。

## v0.30.1 — Phase 3.23 Task Effort Summary

### Changed
- 任務排程相關面板補回本次時間、任務總預計時間及已安排時間。
- 任務名稱下加入幼身安排進度條，比例為已安排時間 ÷ 任務總時間。
- 本次時間放在日期與起訖時間下方，保持 v0.30.0 的直接編輯排版。
- 修改結束時間時，本次時長、已安排數字及進度條會局部同步更新。
- 編輯既有 Session 時會以新時長取代舊時長計算，避免把同一 Session 重複加入已安排時間。

### Tests
- 新增 `smoke:phase-323`，驗證總時間、已安排時間、本次時間、安排進度條及編輯 Session 不重複計算。
- `check`、schema 7、timeline 及 Phase 3.10C–3.23 全部回歸通過。

## v0.30.0 — Phase 3.22 Direct Planner Sheets

### Changed
- 排程面板移除「新增／編輯 XX 時段」標題、副標、欄位小標籤、提示字句及白色資訊框。
- 名稱改為大型直接輸入；日期、起訖時間及重複規則改以字級、留白及分隔線建立層級。
- 日期改用同層自製月份月曆，選擇後直接收回主面板。
- 時間改為開始／結束雙狀態與共用滾輪；修改開始時間時維持原本時長，修改結束時間時重新計算 Session 時長。
- 左上關閉、右上單剔與垃圾桶改為無框 linear icons，顏色跟隨介面主色／文字色。
- 面板外殼改為持續存在，日期、時間、重複等操作只局部更新，不再每次重新播放 sheet-up 動畫。
- 新增時段、任務安排、專注時段及固定時段使用同一直接編輯設計方向，但只顯示各自必要資訊。

### Tests
- 新增 `smoke:phase-322`，驗證自製月曆、開始／結束滾輪、開始時間維持原時長、結束時間更新時長、無框圖示、移除舊欄位框與面板外殼不重建。
- 更新既有 timeline、Phase 3.12A、3.19、3.20 及 3.21 測試，以配合新的直接編輯結構。
- 完整回歸由 `check`、schema 7 及所有 Phase smoke tests 通過。

## v0.29.1 — Phase 3.21 Wheel Picker 修正

### Changed
- 修正日程時間滾輪在調整分鐘後意外重設小時的問題。
- 滾輪初始化改為延後到畫面完成佈局後再定位，並忽略初始化帶來的假 scroll 事件。
- 同值選擇不再觸發多餘重繪，減少滾輪抖動與互相搶焦點。

### Tests
- 新增 `smoke:phase-321`，驗證小時滾輪設定後，分鐘滾輪不會把時間重設回 `00:00`。
- 更新 `check-project.mjs`，加入 wheel init guard 的靜態守衛。

## v0.28.0 — Phase 3.19 Schedule Sheet 重做

### Changed
- 日程新增／編輯面板改為半屏 planner sheet，重新整理資訊層級與字體比例。
- 新增流程右上角改為單剔確認；直接關閉時會彈出「繼續修改 / 刪除草稿」警告。
- 既有專注時段與固定時段編輯改為偏向自動保存；右上角改為垃圾桶。
- 任務／習慣安排時間改成混合式 picker：行內顯示、常用快捷、滾輪。
- 完成型新增的目標選擇改成 bullet list 樣式，不再只是整欄下拉。

### Tests
- 更新 `smoke:timeline` 與 `smoke:phase-312a`，配合新的單剔與 sheet 結構。
- 新增 `smoke:phase-319`，驗證草稿警告、goal bullet picker、以及編輯時自動保存。

## v0.27.0 — Phase 3.18 Lift / Drop / Scroll 收斂

### Changed
- 浮動卡片提起改為更小幅度的縮放與上浮，減少「被放大」感。
- 放手成功後加入短暫 settle，再完成資料寫入���畫面清理，令落位感更自然。
- 邊緣自動捲動再收斂：觸發區由 68px 縮至 56px，初速與最高速度都更低。
- direct preview、quiet snap、移除自動微調與分級空檔規則維持不變。

### Tests
- 新增 `smoke:phase-318`，驗證 lift 後位移、drop settle class 與延後清理。
- 更新 `smoke:phase-314` 容差與清理等待，配合較柔和的提起與落位。

## v0.26.0 — Phase 3.17 Timeline 手感收斂

### Changed
- Timeline 吸附提示改為安靜模式：拖拉途中不再預設顯示 `吸附 HH:MM`，只保留較低調的落點與節點回饋。
- 移除長空檔自動微調模式，避免拖拉中途切換控制節奏。
- 吸附震動改為一次性回饋；成功落點時再補一個短震動，不再沿途反覆觸發。
- 拖拉卡片陰影、吸附描邊與節點放大量都降低，讓 direct preview 更輕。
- 邊緣自動捲動改為更保守的觸發區與速度，減少畫面自行滑動感。

### Tests
- 新增 `smoke:phase-317`，驗證 quiet snap、移除微調、限制震動次數及拖拉清理。
- `smoke:phase-315` 改為驗證吸附仍存在，但拖拉期間不再顯示高調 snap label。
- `smoke:phase-316` 改為聚焦相連任務、短空檔與分級空檔，不再要求精細微調刻度。

## v0.25.0 — Phase 3.16 連續任務貼合與長空檔精細微調

### Changed
- 0 分鐘相連的任務不再插入隱形插入列；相連安排直接貼合，避免被誤解為有空檔。
- 5–29 分鐘真實空檔改為窄身提示列，只顯示剩餘時間，不再使用大型加入按鈕。
- 30 分鐘以上空檔改為分級高度，讓數小時空檔比短空檔提供更大的操作面積。
- 拖拉進入 120 分鐘以上長空檔後，停留約 150ms 會進入局部精細微調模式，顯示前後 30 分鐘刻度並以約 8px = 5 分鐘調整。
- 直接卡片預覽、磁性吸附、來源 ghost 及穩定時間線模型維持不變。

### Tests
- 新增 `smoke:phase-316`，驗證無假空隙、15 分鐘短空檔、長空檔分級高度、精細微調刻度及清理。
- 更新 `check-project.mjs`，加入 `visualGapHeight` 與 `refineGapCandidate` 靜態守衛。

## v0.24.0 — Phase 3.15 直接卡片預覽與磁性吸附

### Changed
- 移除獨立虛線佔位預覽；正在拖拉的任務卡片本身直接顯示最終佔用位置、高度及即時時間。
- 來源位置仍保留低對比 ghost，時間線及其他任務不重新排版。
- 觸控拖拉時以 28px 視覺偏移避開手指；滑鼠維持原取點位置。
- 相鄰任務及工作時段邊界改為 10 分鐘磁性吸附，並以 15 分鐘解除門檻防止抖動。
- 吸附時加入時間軸節點放大、`吸附 HH:MM` 標籤、短彈性動畫及支援裝置上的短震動。
- 拖拉畫面更新改以 requestAnimationFrame 合併，預覽元素不再於每次 pointer move 重建。
- 邊緣自動捲動改為依距離漸進加速的固定畫面循環。

### Tests
- 新增 `smoke:phase-315`，驗證 500ms 長按、直接卡片時間、無重複預覽、10/15 分鐘磁性門檻、吸附回饋、穩定時間線及落點儲存。
- 390×844 Chromium 視覺 QA：卡片直接落點、來源 ghost、左側吸附標籤及無遮擋。

## v0.23.0 — Phase 3.14 Structured 式浮動拖拉

### Changed
- 長按 500ms 後，安排會從時間線「提起」成為全頁浮動卡片，並約 1:1 跟隨指標。
- 原位置保留安靜的虛線佔位；拖拉期間時間線與周圍安排保持穩定，不再即時讓位。
- 目的地改用小型虛線放置預覽及建議時間；五分鐘吸附、鄰近邊界吸附及最多兩項重疊規則維持不變。
- 移除 Phase 3.13 的 ±90 分鐘局部時間尺、目標列展開及周圍卡片位移。
- 待安排任務與已安排項目共用相同的浮動代理與目的地預覽；建立 Session 時不改 Task 截止日。
- 修正浮動卡片被既有 inset 規則定位到頁首的視覺問題。

### Tests
- 新增 `smoke:phase-314`，驗證提起位置、跟手位移、來源佔位、穩定版面、目的地預覽、五分鐘儲存及清理。
- 更新 Phase 3.11A、3.12B、3.13 回歸測試，移除舊時間尺／即時讓位假設。
- 390×844 Chromium 視覺 QA：浮動卡片、來源 ghost、目的地虛線預覽、固定時間線及無文字選取。

## v0.22.0 — Phase 3.13 常駐彈性時間線

### Changed
- 在壓縮今日日程左側加入一直顯示的簡約時間線。
- 工作開始及結束顯示設定時間；任務列顯示開始及結束邊界，卡片內保留完整時間範圍。
- 壓縮空檔只在中央顯示中間時間，同時保留空檔長度與加入時段按鈕。
- 相鄰安排共用時間邊界，減少重複標籤。
- 長按拖拉後顯示前後各 90 分鐘、每 30 分鐘一格的局部時間尺。
- 拖拉卡片改為接近 1:1 跟隨指標，時間仍按每 8px／5 分鐘更新及吸附。
- 目標時段會局部展開，周圍安排即時讓位；接近視窗邊緣時自動捲動。

### Tests
- 新增 `scripts/smoke-phase-313.mjs`，覆蓋常駐時間線、任務邊界、空檔中點、局部時間尺、跟手拖拉及儲存。

## v0.21.0 — Phase 3.12B 壓縮日程與手勢收斂

### Changed
- 今日日程改為事件導向的壓縮式行程，移除整日等比例時間軸。
- 30 分鐘以下空檔不顯示；較長空檔收斂為可操作的短提示。
- 任務卡改用四段緊湊高度，保留大概時長感而不拉長整頁。
- 加入固定的工作開始／結束生活化標記。
- 時段需確實長按 0.5 秒才進入拖拉；長按前捲動會取消拖拉。
- 拖拉時卡片內起訖時間按每 8px／5 分鐘即時更新，並保留相鄰邊界吸附。
- 今日焦點／清單、日程今日／本週及花園分段支援水平 Swipe，切換後回到頁頂。
- 待安排任務可拖到壓縮空檔或隱藏的小型插入區建立 Session。

### Tests
- 新增 `scripts/smoke-phase-312b.mjs`，覆蓋壓縮空檔、生活化標記、長按門檻、即時時間及 Swipe。

## v0.20.0 — Phase 3.12A 時間線閱讀與執行狀態

### Added
- 今日時段卡使用半比例高度，短任務保持可點擊，長任務避免過度拉長。
- 現在時間加入文字標記；正在進行、已完成的過去項目及過去未完成項目使用不同但克制的視覺狀態。
- 進入今日時間線時自動捲到現在附近。
- 時間線末端加入預設收起的「待安排」區，可展開、直接安排或長按拖入時間線。
- 手動安排最多同時兩項；第三項會被拒絕並列出現有兩項。
- 匯入、外部日曆或重複規則造成的三項以上重疊會合併為衝突卡，資料不會被刪除。
- 新增 `scripts/smoke-phase-312a.mjs` 覆蓋高度、現在狀態、待安排區、衝突合併及第三項限制。

## v0.19.0 — Phase 3.11C 狀態、花園與設定收斂

### Changed
- 目標詳情以安靜、可點按的摘要列取代「進行中」狀態膠囊，並保留原有狀態 Sheet。
- 任務列只顯示一項最高優先工時訊息；完整總計、已排、完成與尚餘仍保留在任務詳情。
- 階段內新增任務改為小型行內操作；修正重複「階段／階段」文案。
- 花園內層導航收斂為置中的「花園／圖鑑／造景」segmented control；裝飾與商店功能保留於「造景」。
- 移除「更多」入口頁；右上角選單直接開啟單一設定面板，整合顯示、可用時間、排程偏好、提醒回顧、活動歷史及資料備份。

### Added
- 新增 `scripts/smoke-phase-311c.mjs`，覆蓋安靜狀態列、工時摘要、階段操作、花園分段導航及單層設定。

## v0.18.0 — Phase 3.11B 全域任務與本週拖拉

### Added
- 今日焦點、今日清單及建議任務支援長按排序；只改當日 DailyPlan 順序，不改截止日或專案結構。
- 目標內階段及零散任務支援同容器拖拉；相同截止日或同為無期限時可排序。
- 截止日不同時維持日期優先並彈回原位；有截止日永遠排在無期限任務之前。
- 本週頁加入置頂七日投放列：已安排專注時段可拖到其他日期並保留開始時間；未安排任務拖入日期後建立 Session。
- 長按拾起、浮起陰影、投放目標高亮、無效排序彈回及支援裝置短震動。
- 新增 `scripts/smoke-phase-b.mjs`，覆蓋今日排序、期限約束、同容器排序及跨日 Session 行為。

### Changed
- 本週拖拉不再修改 Task 截止日。
- 目標／階段任務顯示按截止日優先，再使用同日期內的手動順序。

## v0.17.0 — Phase 3.11A 單一 Structured 時間線

### Added
- 今日改為單一 Structured 式時間線，直接呈現工作時間、時段邊界、動態空檔及當前時間。
- 60 分鐘或以上空檔顯示「加入時段」；15–59 分鐘只顯示剩餘時間；更短空檔隱藏。
- 統一「加入時段」入口：可選擇現有任務，或用「需要完成／打卡」與「重複」推導任務、習慣或固定時段。
- 長按拖拉提供浮起、陰影、即時開始／結束時間、15 分鐘刻度及前後邊界吸附；支援裝置會提供短震動。
- 時段重疊改為容許並排顯示，以小型警告標記提示，不再阻止安排。
- 重複習慣及固定時段拖拉後可選「只改今天」或「今天及之後」。

### Changed
- 日程分頁文字縮短為「今日／本週」並使用較小 segmented control。
- 時段超出工作時間時時間線自動延伸；跨越午夜時移到翌日 00:00。
- 時間及每日專注上限改成非阻擋警告。
- `smoke:timeline` 更新為 Phase 3.11A 的空檔、重疊、統一新增、拖拉及 recurrence 測試。

## v0.16.0 — Phase 3.10C 導航與互動收斂

### Added
- 今日頁加入���週規劃入口，完成或返回後會回到今日。
- 目標狀態改用與篩選器一致的底部 Sheet。
- 全域新增按鈕直接開啟「新增行動」，並提供「設為習慣」切換。
- 新增 `scripts/smoke-phase-c.mjs`，覆蓋三項導航、花園入口、導航重置、狀態 Sheet、新增行動、習慣切換及每週規劃。

### Changed
- 底部導航收斂為「今日／目標／日程」；花園改由今日 Hero 進入。
- 再次點擊主要導航會回到各頁標準入口：今日焦點、目標列表、今日日程。
- 目標頁移除路線圖入口及領域篩選；新增目標只保留在目標頁。
- 階段內任務改為較小的從屬列，並隱藏永久拖曳把手。
- 「今天，先走這三步」及「稍後留意」的任務名稱可直接開啟詳情。
- 每週規劃不再重複出現在「更多」。
- 主要可見介面統一採用「專注時段／固定時段／階段」等中文名稱。

### Fixed
- 習慣頻率轉輪在表單關閉後仍延遲更新而觸發瀏覽器錯誤。
- 舊領域值不再影響今日、目標或日程的可見項目。

## v0.15.0 — Phase 3.10B 人性化日程時間線

### Added
- 今日日程改為混合時間線：預設簡潔摘要，按「展開」、新增或拖拉時提供完整時間刻度。
- 時間線與任務卡的細小 `＋` 改為手動安排入口，不再直接自動選擇空檔。
- 尚未安排任務可按今日、焦點、期限及剩餘工時排序、搜尋，並可直接建立新任務後繼續安排。
- 安排詳情顯示日期、開始、本次時長及結束時間預覽；時間未定時必須自行選擇本次時長。
- 專注時段支援長按拖拉及 15 分鐘吸附，完成後自動收回時間線並可復原。
- 習慣可設定預計時長及預設時間；符合 recurrence 的日期會出現在時間線，單日移動不影響其他日期。
- 完成專注時段達到任務總預計時間時，先詢問是否完成任務，不會自動完成成果。
- 新增 `scripts/smoke-timeline.mjs`，覆蓋摘要／展開、衝突禁止、安排、拖拉、新任務續接、習慣時段及完成詢問。

### Changed
- 日程主分頁只保留「今日節奏／本週安排」，移除月曆入口。
- 今日及目標任務列的安排操作改成單一 `＋` 圖示。
- 今日日程採用「專注時段／固定時段／外部行程」中文名稱。
- 與專注時段、習慣時段、固定時段或外部行程重疊時禁止放置；可先主動縮短本次時長。

### Fixed
- 時間未定任務不再被手動安排流程默認成一小時。
- 完成專注時段不再等同完成任務。

## v0.14.0 — Phase 3.10A 核心資料模型收斂

### Added
- schema v7：新增可去重／可反轉的進度事件來源鍵、獨立水滴交易帳本、習慣 recurrence 邊界，以及 GardenWeek 結算欄位。
- 新增 `scripts/smoke-schema7.mjs`，覆蓋 v6→v7 migration、任務關聯修復、歷史 DailyPlan、事件／獎勵去重、花種收藏與瀏覽器錯誤。

### Changed
- 里程碑正式作為階段容器：有任務的階段由子任務完成狀態推導；Goal 與 Project 共用同一套進度算法。
- Task 不再保存實際開始時間；舊 `due + time` 會 migration 成專注時段。時間未定維持 `null`，不再靜默當成 60 分鐘。
- 完成項目只清理今日及未來計劃，保留過去 DailyPlan 歷史。
- 花園圖鑑只把已結算週次計作已收集；本週花種維持預測狀態。安慰苔只在盛開階段顯示完整形態。
- 花園主色改由本週主要推進目標的顏色決定，不再由領域決定。
- 水滴餘額改由交易紀錄計算並保證不為負數；重新開啟／再次完成同一來源不會重複發獎。

### Fixed
- 刪除專案或階段時，所屬任務現在會清除失效 `pid`／`mid` 並退回零散任務。
- 修正階段內任務完成時 Project 進度與 Goal 進度不一致。
- 修正本週預測花種被提前計入永久圖鑑。

### Migration
- schema 6 的任務補上 `estimateMinutes`；舊開始時間轉成 migrated Session。未定時長使用舊版等值 60 分鐘並標記 `needsReview`，方便之後確認。
- 舊花園道具及水滴以 opening adjustment 保存，避免 migration 後出現負餘額。

## v0.13.9 — Phase 3.9 花園花種系統（六種可收集）

### Added
- 花園改為「每週一朵花」，花種由本週的行為決定，共六種：日常花（平常一週）、豐盛花（完成很多）、恆心花（天天有進度）、繽紛花（推進多個目標）、傳說花（完成一個里程碑，稀有）、安慰苔（完成度低但有回來）。原則：不惩罰，總會長出一點什麼。
- 花種圖鑑：收藏頁新增六格圖鑑，已收集顕示花名與解鎖條件，未解鎖以灰階剪影（？？？）呈現，頂部顯示已收集 X/6。
- 每週結算時（ensureGardenWeek）將上週花種連同生長階段存進圖鑑永久保留。

### Changed
- 花的畫風維持原本的平面手繪風（未加水彩/動畫風）；各花種只在盛開階段呈現不同花型，生長階段（種子→發芽→抽高）一致。

## v0.13.8 — Phase 3.8 狀態標籤合一

### Changed
- 目標詳情：移除重複的狀態下拉按鈕；改為直接點標題下方那顆狀態藥丸即可彈出狀態選單（進行中／暫停／已達成／封存）。狀態只顯示一處，所見即所點，更直觀。藥丸尾部加上 ▾ 暗示可點，觸控區已加大。

## v0.13.7 — Phase 3.7 狀態卡簡化與排程順手化

### Changed
- 目標詳情：移除「目標狀態」那塊白色卡片框（.statusctl）與標題，只保留狀態切換按鈕本身。
- 安排 Session：本次時間預設改為所選任務的剩餘時間（不再固定 30 / 120 分）；切換任務時自動��新帶入該任務的剩餘時間。

### Added
- 任務卡新增「＋排入」一鍵排程按鈕：自動將任務的剩餘時間排進未來兩週內第一個合適空檔（遵守可用時段、每日專注上限、休息間隔），非自動排程，一鈕完成，可復原。

## v0.13.6 — Phase 3.6 目標版面簡化與今日清單

### Changed
- 目標版面：完全移除佔滿整列的狀態篩選橫框，改為依狀態自動分組——進行中目標直接置頂，暫停��已達成僅在有內容時才顯示分區，封存收入最底的可展開摢疊區。

### Added
- 今日版面新增「焦點｜清單」切換：焦點為原有花園與建議行動；清單列出所有進行中目標下的待辦任務（不限今天），依逾期／今天／近幾天／未排期／無期限分組，底部提醒暫停中的目標數量。

## v0.13.5 — Phase 3.5 介面順手化

### Changed
- 目標狀態篩選由「框內展開清單」改為輕巧的狀態藥丸，點按後從底部彈出選單，不再霸佔整行。
- 目標詳情裡的任務卡整列可點，點任何位置即可開啟編輯（不限標題）。
- 「總預計時間」改為原生下拉滾輪，並新增「未定」選項；時間未定的任務會顯示「時間未定」而非硬填工時。

### Added
- 編輯任務可重新指派歸屬（零散／專案→階段，含就地新增階段）、設定開始時間，並顯示開始時間標籤。

### Fixed
- 修正狀態篩選「暫停」誤植為簡體「暂停」。

## v0.13.4 — Phase 3.4 兩層歸屬與里程碑即階段

### Changed
- 任務歸屬重整為兩種：零散任務，或「某專案的某階段（里程碑）」；移除「掛專案但不屬任何階段」的中間狀態。
- 里程碑正式定位為「階段」：目標詳情中，任務直接分組顯示在所屬里程碑之下，里程碑進度＝其下任務完成度。
- 里程碑不再出現在 Dashboard 今日、逾期、排程候選與工作 Session 清單；今日只顯示可執行的任務。

### Added
- 新增任務時，選擇專案後可再選「階段（里程碑）」；若該專案尚無階段，可就地輸入名稱一鍵建立（甲方案）。

### Migration
- schemaVersion 升至 6：既有「掛專案」的任務一律轉為零散任務（清空 pid），並為所有任務補上 mid 欄位（預設 null）。

## v0.13.3 — Phase 3.3 專案任務、進度細算與節奏

### Added
- 任務可歸入專案；目標詳情的專案卡會摺疊顯示其任務，並計入專案進度。
- 目標卡與詳情新增「本週節奏」環與標籤，反映習慣的每週完成比例。
- 目標健康度會將積壓的習慣一併納入「需要關注」判斷。

### Changed
- 目標進度改為按比例細算（未完成的次數任務依 count／target 折算）。
- 目標狀態改為收合式選單（點擊才展開），狀態篩選同樣收合。
- 新增／編輯目標時「領域」等同目標本身，移除獨立領域欄位（穩健處理）。

### Fixed
- 修正輸入任務名稱時按空白鍵會誤觸互動元件、導致無法輸入含空格名稱的問題。

### Removed
- 移除新增目標的「領域」欄位，以及今日／目標頁的領域篩選按鈕。

## v0.13.2 — Phase 3.2 目標追蹤修正與次數任務

### Added
- 任務新增「需完成次數」欄位；多於一次時顯示 N／次進度，逐次點擊累積，達標自動完成。
- 花園 Hero 顯示本週完成次數與距離下一次成長的提示。
- 目標頁「全部」篩選改為依狀態分組（進行中／暫停／已達成／封存）。

### Changed
- 習慣打卡改用統一入口 doAction，並支援撤銷與即時回饋。
- 匯入備份改為完整取代現有資料（先自動備份可撤銷），並加強格式驗證。

### Fixed
- 修正習慣勾選只切換 done 而未寫入完成日期的問題；overdue／streak 改由完成日期推算。
- 修正焦點下一步彈窗遮罩無法點擊關閉。

### Removed
- 移除目標「等待」狀態、里程磑「等待」概念與里程磑子任務。
- 移除半殘的任務重複（recur）欄位，改由次數任務取代。

## v0.13.1 — Phase 3.1 data rules

- Added date-scoped daily plans and migrated legacy Today pins.
- Added one habit completion per date with toggle and computed streaks.
- Excluded waiting milestones from actionable next steps.
- Made the Today display limit effective, with a show-all control.
- Added cascade cleanup for deleted goals, projects, tasks, habits, and time-block exceptions.
- Added weekly Garden records and automatic collection archiving.
- Added `viewport-fit=cover` and corrected goal-health copy.

## v0.13.0 — Phase 3 usability and accessibility

### Added
- Added keyboard activation for non-button interactive elements.
- Added dialog roles, accessible labels, initial focus, focus trapping, Escape close, and focus return.
- Added visible keyboard focus styles and accessible labels for icon-only controls.
- Added safe-area spacing and reduced-motion support.
- Added import validation, file-size protection, progress feedback, and visible error states.

### Changed
- Increased primary touch targets to at least 44 px.
- Increased bottom navigation targets and improved secondary-text contrast.
- Expanded checkbox hit areas without changing their visual size.
- Standardized backup copy and success/error feedback.

## v0.12.0 — Phase 2 Today experience

### Added
- Added a primary “今天，先走這三步” focus card.
- Added direct completion and habit check-in actions from the focus card.
- Added goal context to Today task cards and priority actions.
- Added a collapsible “稍後留意” section for waiting and upcoming items.

### Changed
- Compressed the Garden Hero while keeping it as the first visual element.
- Moved the compact schedule summary directly below the primary Today action.
- Reduced duplicate task presentation by removing priority items from secondary lists.
- Made remaining habits secondary and collapsed by default for new states.
- Reordered the Today page to Garden → priorities／empty CTA → schedule → secondary content.

## v0.11.0 — Phase 1 IA

### Added
- Added top-level Goal／Roadmap modes inside the Goals page.
- Added guided empty states for Goals, Roadmap, and Today.
- Added “為今天選一步” to choose an unscheduled action from an active goal.
- Added a follow-up path to create a task when a goal has no available next step.

### Changed
- Renamed the bottom “時間軸” destination to “日程”.
- Renamed schedule modes to “今日節奏／本週安排／月曆”.
- Moved Roadmap out of Schedule and into Goals.
- Simplified the global FAB to Task／Habit／Goal.
- Kept Project creation inside Goal details.

### Removed
- Removed Project from the global add chooser.
- Removed Roadmap from the Schedule tabs.

## v0.10.2 — Phase 0 stabilization

### Added
- Added a goal-first guard when creating a task, project, or habit in an empty workspace.
- Added automatic resume of the intended add flow after the first goal is created.
- Added weekly-key tracking for the weekly review popup.
- Added static project checks through `npm run check`.
- Added `FUTURE_ARCHITECTURE.md` to separate future React plans from the current prototype.

### Changed
- Made `index.html` the single source and deploy entry point.
- Updated project and development documentation to describe the current static prototype accurately.
- Marked reminder controls as prototype-only and clarified that no system notification is sent.

### Removed
- Removed the non-functional language selector.
- Removed the non-functional constellation reward selector.
- Removed the duplicate `src/index.html` source copy.

### Fixed
- Fixed corrupted replacement characters in interface copy.
- Fixed the weekly review popup persisting forever after its first display.
- Fixed silent loss of tasks, projects, and habits when no goal exists.

## v0.10.1 — Documentation package

- Added `PROJECT.md`.
- Added `DESIGN_WORKFLOW.md`.
- Updated the Vercel-ready deploy package.


## v0.10.0 — Blank Mobile Trial Build

- Removed all default goals, projects, milestones, tasks, habits, achievements, sessions, time blocks, external events, activity history, and garden inventory.
- Preserved the full app interface and interaction model.
- Preserved Dashboard Garden Hero, Goals, Timeline Today/Week/Calendar/Roadmap, Garden, More, quick add, filters, scheduling, backup, and settings.
- Changed browser persistence to the isolated `ght_state_blank` key.
- Added a Vercel-ready project structure and deployment configuration.

## Base prototype features

- Dashboard Garden Hero and global HUD
- Compact area filter with bottom sheet
- Goal next steps, focus goals, statuses, health, and momentum
- Task Sessions, recurring/one-off Time Blocks, availability, and smart scheduling
- Today, Week, Calendar, and Roadmap timeline modes
- Garden rewards, shop, inventory, and auto-placement
- Data export/import, schema migration, and undo support
