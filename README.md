# Goal & Habit Tracker — Blank IA Prototype

## Current prototype — v0.42.6-test
真機回歸版 Build P04D-0725A。五種編輯器的名稱 textarea 完整保留 v0.42.4 已驗證的屬性及 IME 行為，但移出詳細資料 scroll container，改為真正固定的獨立名稱區；詳細資料繼續內部捲動。鍵盤可視邊界下方加入純背景延伸層，填平 iOS Input Assistant 區域後方而不增加內容高度。固定 Sheet 頂部、56px 導航、右側垂直日期 Rail、Schema 7 及 `ght_state_blank` 均維持不變。


## Current prototype — v0.42.5-test
真機測試版 Build P03D-0725A。任務、習慣、目標、專案及階段編輯器改用 TimeBlocks 式固定頂部 Sheet：鍵盤彈出時面板頂部保持不動，只從底部縮短；工具列與名稱維持可見，詳細資料在內部捲動。底部導航採 56px 本體、6px 上方 padding 及完整 Home Indicator safe area。本週取消頂部橫向放置列，長按拖拉時改顯示右側垂直日期 Rail，同時高亮真正的垂直日期區塊並支援邊緣自動捲動。Schema 維持 7，儲存鍵維持 `ght_state_blank`。


## Current prototype — v0.42.1
完成第一輪 iPhone Safari 真機穩定性修正：App shell 固定於 visual viewport，外層文件不再帶動導航上下移動；全卡長按加入 500ms 進度及移動取消；任務、習慣、目標、專案與階段編輯器局部更新時維持同一主面板，並停止反覆搶走中文輸入焦點。目標總覽另加入可恢復安全狀態，日程拖拉自動捲動改用 App 內頁。

## Current prototype — v0.42.0
完成 Phase 3.37 發佈硬化：五個主要頁面通過四組手機 viewport matrix，極窄畫面與長名稱不會造成水平 overflow，並全域支援 reduced motion。備份匯入加入 5 MB 限制、future-schema 與巢狀資料驗證、程式內確認、交易式 rollback，以及可見的 localStorage quota 警告；大型資料 fixture 亦納入 smoke test。

## Current prototype — v0.41.0
完成跨面板生命週期與無障礙整理：新增內容必須先輸入名稱；已修改草稿離開時會出現面板內確認；Escape 會按新增、編輯或一般對話框語意處理。所有 dialog 具備標題關聯、焦點限制及關閉後焦點返回，代表性輔助面板亦通過 320px 溢出檢查。

## Current prototype — v0.40.0
專案與階段新增／編輯已統一成直接式底部面板。兩者使用單一 handle、線性頂部操作、大型名稱及 inline 截止日；階段另提供直接式總預計時間。專案標題現在可直接開啟編輯，編輯會保留所有階段、子項及任務關聯。

## Current prototype — v0.39.0
目標新增與編輯已統一成直接式底部面板：單一 handle、線性頂部操作、大型目標名稱、直接式目標類型、44px 顏色選擇、inline 月曆及較完整的初心文字區。新增以右上角單剔建立；編輯關閉時保存並保留所有專案、任務與習慣子資料。

## Current prototype — v0.38.0
習慣新增與編輯已統一成直接式底部面板，沿用任務面板的單一 handle、線性頂部操作及大型名稱層級。重複規則保留簡易轉輪與完整自訂模式；每次時間改為直接選項，預設開始時間改用 inline hour/minute wheel，編輯關閉時保存並保留既有打卡歷史。

## Current prototype — v0.37.0
任務新增與編輯已統一成直接式底部面板：單一 handle、線性頂部操作、大型任務名稱、inline 月曆、預計時間選項及完成次數 stepper。新增使用右上角單剔建立；編輯在關閉時保存並於右上角提供刪除，不再保留底部取消／儲存列。

## Current prototype — v0.36.0
完成五個主要頁面的 44px 觸控區修正：今日分段、目標新增、日程切換與局部加入，以及花園返回／日夜／分段控制均已擴大。五頁 UI audit 的 smallCount、unnamedCount、水平 overflow 及重複 ID 現時全部為 0。

## Current prototype — v0.35.0
設定頁改為七個摘要入口與同層子頁；每週可用時間按日展開，開始／結束時間及每日回顧時間改用具名 inline wheel。專注偏好不再使用原生 select，設定首頁與所有子頁的可見控制均達 44px。

## Current prototype — v0.34.1
Timeline 頁已直接隱藏 global FAB，新增入口集中於頁內的「加入時段」、空檔及待安排區。新增 `UX_AUDIT.md` 與 `audit:ui`，記錄五個主頁的 overflow、觸控區、控制命名及原生表單元件檢查結果。

## Current prototype — v0.34.0
重複固定時段現在顯示具體星期、有效開始／結束日期及包含當日的結束語意；日期改動會同步每週重複日。若目前日期已有單次 override 或 skip，面板會顯示例外狀態、實際時間及「恢復系列設定」，所有操作仍在同一直接排程面板內完成。

## Current prototype — v0.33.0
修正直接排程面板同時顯示舊 pseudo handle 與新拖拉 handle 的問題，現在只保留一個可操作 handle。重複時段範圍、刪除範圍與草稿放棄確認改為在原面板內展開，不重建面板、不重播滑入動畫，取消後亦保留原有草稿及捲動情境。

## Current prototype — v0.31.0
排程新增面板以同層任務選擇器取代原生下拉選單，支援搜尋、目標色點與尚餘時間；滾輪可直接點按非中央選項並改善吸附／捲動隔離；名稱與搜尋輸入會配合行動裝置鍵盤收起展開內容、維持目前面板及編輯位置。

## Current prototype — v0.30.2
「本次時間」改為可點按欄位；點按後會在同一排程面板展開單欄時長滾輪。調整後，結束時間、已安排時間與安排進度條會即時同步，面板不會重新滑入。

## Current prototype — v0.30.1
任務排程面板補回工時資訊：任務名稱下顯示總預計時間、已安排時間及安排進度條；日期與起訖時間下面顯示本次時間。調整結束時間時，本次時間、已安排時間及進度條會同步更新。

## Current prototype — v0.30.0
排程面板改為直接編輯式 planner sheet：不再顯示「編輯 XX 時段」標題、欄位小標籤、白色資訊卡與操作提示。名稱直接放大；日期、起訖時間及重複規則依字級排列。日期使用同層自製月曆；時間使用同層「開始／結束」切換及滾輪。面板外殼只建立一次，修改日期、時間或頻率時不會再次滑入。

## Current prototype — v0.29.1
全程式面板視覺再統一：一般 modal、篩選 sheet、商店購買 sheet 都收斂到同一組 planner-sheet 語言；日程時間 picker 的提示小字（例如「列表＋滾輪」）亦已移除，讓畫面更乾淨。

## Current prototype — v0.28.0
Schedule sheets 改成半屏 planner sheet：新增流程改為右上角單剔確認；直接離開會先詢問繼續修改還是刪除草稿；既有時段編輯改為偏向自動保存，右上角改為垃圾桶。時間輸入也改成行內顯示＋常用快捷＋滾輪混合選擇，完成型新增可用較美觀的目標 bullet list 選擇歸屬。

## Current prototype — v0.27.0
Timeline 再做一層動作手感收斂：拖拉提起更輕、落位加入短暫 settle，邊緣自動捲動再保守一點，整體更接近連續而自然的滑動感。

## Current prototype — v0.26.0
Timeline 先做一輪手感收斂：吸附提示改為更安靜，拖拉時不再高調顯示吸附標籤；自動微調模式移除，長空檔回到單一拖拉節奏；卡片陰影、吸附描邊與邊緣自動捲動都更克制。
今日日程的連續任務不再被假空隙分開；0 分鐘相連項目直接貼合，5–29 分鐘空檔改為窄身提示，長空檔按時長分級高度顯示。
日程拖拉已改成單一卡片直接預覽：任務本身顯示落點和即時時間，不再被另一個佔位框遮擋；相鄰任務及工作邊界加入可見的磁性吸附與防抖門檻。

可直接部署及試用的手機優先互動原型。

## Project structure
- `index.html` — 唯一程式來源及 Vercel entry point
- `PROJECT.md` — 目前原型的 source of truth
- `FUTURE_ARCHITECTURE.md` — 未來 React／TypeScript 方向
- `DESIGN_WORKFLOW.md` — IA 與開發流程
- `CHANGELOG.md` — 版本紀錄
- `scripts/check-project.mjs` — 靜態專案檢查
- `vercel.json` — Vercel 靜態部署設定

## Run locally
```bash
python3 -m http.server 4173
```
然後開啟 `http://localhost:4173`。

## Check
```bash
npm run check
# 另開本機伺服器後可執行 schema v7 browser smoke
npm run smoke:schema7
npm run smoke:timeline
npm run smoke:phase-c
npm run smoke:phase-b
npm run smoke:phase-311c
npm run smoke:phase-312a
npm run smoke:phase-312b
npm run smoke:phase-313
npm run smoke:phase-314
npm run smoke:phase-315
npm run smoke:phase-316
npm run smoke:phase-317
npm run smoke:phase-318
npm run smoke:phase-319
npm run smoke:phase-320
npm run smoke:phase-321
npm run smoke:phase-322
npm run smoke:phase-323
npm run smoke:phase-324
npm run smoke:phase-325
npm run smoke:phase-326
npm run smoke:phase-327
npm run smoke:phase-328
npm run smoke:phase-329
npm run smoke:phase-330
npm run smoke:phase-331
npm run smoke:phase-332
npm run smoke:phase-333
npm run smoke:phase-334
npm run smoke:phase-335
npm run smoke:phase-336
npm run smoke:phase-337
npm run audit:ui
```
檢查內容包括：
- inline JavaScript 語法
- HTML 基本結構
- 損壞字元
- Phase 0 必要 guard
- 不存在重複的 `src/index.html`

## Deploy to Vercel
本專案無 build step。將整個資料夾上傳至 Git repository 或 Vercel，根目錄必須包含 `index.html` 及 `vercel.json`。

## Data behavior
- 資料只保存在瀏覽器 localStorage。
- key：`ght_state_blank`
- 清除網站資料會重設原型。
- 可使用 App 內 JSON 匯入／匯出備份。

## Current boundary
這是 IA／UI 互動原型，不是 React、TypeScript 或 PWA 正式版。提醒選項目前只保存偏好，不會發送系統通知。
