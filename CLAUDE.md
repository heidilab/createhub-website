# 創研社 CREATE HUB — Claude 工作規則

## 每次改動後必須更新 Notion 開發記錄

完成任何功能新增、修正、優化或設定改動，並 push 到 GitHub 之後，要喺 Notion「📝 開發更新記錄」database 加一行：

- Data source：`collection://26193785-b3c2-485d-9386-b9e11fd00a9d`
- 欄位：
  - `更新內容`（標題，一句講晒改咗咩）
  - `date:日期:start`（YYYY-MM-DD）、`date:日期:is_datetime` = 0
  - `類型`：新功能 ／ 修正 ／ 優化 ／ 設定/基建 ／ 內容更新
  - `模組`（JSON array）：活動系統、報名管理、Admin 後台、會員/登入、Email 自動化、前台頁面、基建/部署、文件
  - `Commit`：`https://github.com/heidilab/createhub-website/commit/<短 hash>`
  - `說明`：用廣東話書面語寫清楚改咗咩、點解改、對用戶有咩影響

冇 commit 嘅改動（例如 DNS、Firebase、Vercel 環境變數、手動觸發 cron）都要記錄，`Commit` 留空。

如果改動令功能狀態有變（例如由「未做」變「已完成」），同時更新「🗺 網站結構與功能地圖」頁第七部分：
https://app.notion.com/p/3ea1dc1e991581e9b271fdb9b0fe7504

如果改動影響用戶流程或權限，同時更新「👥 用戶角色、權限與使用流程」頁：
https://app.notion.com/p/3ea1dc1e9915816da5f2e430894f77b8

Notion 總覽頁：https://app.notion.com/p/3ea1dc1e991580708a14f3aafad267a1

## 部署注意事項

- Push 前先喺本地行 `npm run build`，Vercel 用嚴格 ESLint 同 type check。
- 新增 Firestore 複合查詢要更新 `firestore.indexes.json`，並提醒用戶行 `firebase deploy --only firestore:indexes`。
- `auth.createhub.biz` 係 Google 登入必需嘅子網域（Firebase Hosting），唔好移除。
