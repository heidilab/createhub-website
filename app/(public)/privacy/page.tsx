import LegalLayout from "@/components/legal/LegalLayout";
import { SITE } from "@/lib/constants";

export const metadata = {
  title: "私隱政策",
  description:
    "創研社 CREATE HUB 私隱政策 — 我哋如何收集、使用同保護你嘅個人資料。",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout
      eyebrow="Privacy Policy"
      title="私隱政策"
      watermark="PRIVACY"
      lastUpdated="2026 年 4 月 25 日"
    >
      <blockquote>
        本文件係創研社 CREATE HUB（以下簡稱「我哋」、「本網站」）依據香港《個人資料（私隱）條例》（PDPO）及相關法規而制定嘅私隱政策。請仔細閱讀，使用本網站即代表你同意以下條款。
      </blockquote>

      <h2>1. 簡介</h2>
      <p>
        創研社 CREATE HUB（由 <strong>Create Hub Limited</strong> 營運）尊重你嘅私隱，致力按照香港法律保障你嘅個人資料。本政策說明我哋會收集咩資料、點樣使用、點樣保存，以及你嘅權利。
      </p>

      <h2>2. 我哋收集嘅資料</h2>
      <h3>2.1 你直接提供嘅資料</h3>
      <ul>
        <li><strong>會員註冊資料</strong>：姓名、電郵地址、密碼、WhatsApp 號碼（選填）</li>
        <li><strong>Google 登入資料</strong>：當你使用 Google 帳戶登入，我哋會收到你嘅 Google 顯示名、電郵地址同頭像 URL</li>
        <li><strong>活動報名資料</strong>：報名活動時嘅票種、付款狀態</li>
        <li><strong>聯絡表單資料</strong>：姓名、電郵、WhatsApp、查詢類別同訊息內容</li>
        <li><strong>付款資料</strong>：付款卡片資料**完全由 Stripe 處理，我哋唔會儲存**你嘅完整卡號或 CVC，只保留交易 ID 同付款狀態</li>
      </ul>

      <h3>2.2 自動收集嘅資料</h3>
      <ul>
        <li>瀏覽器類型、裝置資料、IP 地址</li>
        <li>瀏覽記錄（你瀏覽過嘅頁面、停留時間）</li>
        <li>Cookies 及類似技術所收集嘅資料</li>
      </ul>

      <h2>3. 資料用途</h2>
      <p>我哋收集嘅資料用嚟：</p>
      <ul>
        <li>建立同管理你嘅會員帳戶</li>
        <li>處理活動報名、付款及確認</li>
        <li>發送活動確認、提醒及更新通知</li>
        <li>回覆你嘅查詢同提供客戶支援</li>
        <li>發送 Newsletter 同行銷資訊（你可隨時取消訂閱）</li>
        <li>改善我哋嘅服務、網站體驗及內容</li>
        <li>遵守法律或合規要求</li>
      </ul>

      <h2>4. 第三方服務商</h2>
      <p>
        為咗提供服務，我哋會將你部分資料分享畀以下信譽良好嘅第三方服務商。佢哋只會根據我哋嘅指示處理資料，並受其私隱政策約束：
      </p>
      <ul>
        <li>
          <strong>Google Firebase</strong>（會員認證、資料庫、檔案儲存）—{" "}
          <a href="https://firebase.google.com/support/privacy" target="_blank" rel="noopener noreferrer">
            Firebase Privacy
          </a>
        </li>
        <li>
          <strong>Stripe</strong>（付款處理）—{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer">
            Stripe Privacy
          </a>
        </li>
        <li>
          <strong>Resend</strong>（電郵發送）—{" "}
          <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            Resend Privacy
          </a>
        </li>
        <li>
          <strong>Vercel</strong>（網站托管）—{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            Vercel Privacy
          </a>
        </li>
        <li>
          <strong>YouTube / Google</strong>（嵌入影片，需要時）—{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google Privacy
          </a>
        </li>
      </ul>

      <h2>5. 資料儲存與保安</h2>
      <p>
        你嘅資料儲存喺 Google Cloud（Firebase）嘅伺服器（亞洲區域），並透過 HTTPS 加密傳輸。我哋採取行業標準保安措施，包括：
      </p>
      <ul>
        <li>所有資料傳輸均使用 TLS 加密</li>
        <li>密碼以 bcrypt / scrypt 加密儲存（即使我哋亦無法查閱）</li>
        <li>付款資料完全由 Stripe 嘅 PCI-DSS 認證系統處理</li>
        <li>會員角色權限管理（只有授權管理員可以查閱會員資料）</li>
      </ul>
      <p>
        雖然我哋會盡力保障你嘅資料，但互聯網傳輸冇辦法 100% 保證安全，請你自己保護好帳戶密碼。
      </p>

      <h2>6. Cookies</h2>
      <p>
        我哋使用 Cookies 嚟維持你嘅登入狀態、記錄你嘅偏好設定，以及分析網站使用情況。你可以透過瀏覽器設定停用 Cookies，但部分功能（例如登入）可能會無法正常運作。
      </p>

      <h2>7. 你嘅權利（依據 PDPO）</h2>
      <p>根據香港《個人資料（私隱）條例》，你享有以下權利：</p>
      <ul>
        <li><strong>查閱權</strong>：要求我哋提供你嘅個人資料副本</li>
        <li><strong>更正權</strong>：要求修正不準確嘅資料</li>
        <li><strong>刪除權</strong>：要求刪除你嘅帳戶及相關資料（部分資料可能基於法律要求需要保留）</li>
        <li><strong>反對行銷</strong>：隨時取消 Newsletter 訂閱</li>
        <li><strong>投訴權</strong>：向香港個人資料私隱專員公署（PCPD）提出投訴</li>
      </ul>
      <p>
        要行使以上權利，請電郵至{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>。我哋會喺合理時間內回覆。
      </p>

      <h2>8. 資料保留期</h2>
      <ul>
        <li>會員帳戶資料：直到你刪除帳戶或主動要求刪除</li>
        <li>活動報名記錄：保留 7 年（會計同稅務合規要求）</li>
        <li>付款記錄：依 Stripe 同會計法規保留</li>
        <li>聯絡表單訊息：保留 2 年</li>
        <li>Newsletter 訂閱：直到你取消訂閱</li>
      </ul>

      <h2>9. 兒童私隱</h2>
      <p>
        本網站唔係特別針對未成年人。如未滿 18 歲，請喺家長或監護人同意下使用。如我哋發現未經同意收集咗未成年人嘅資料，會立即刪除。
      </p>

      <h2>10. 跨境資料傳輸</h2>
      <p>
        由於我哋使用嘅第三方服務商部分位於海外（例如 Stripe、Vercel 嘅伺服器可能喺美國），你嘅資料可能會被傳輸到香港以外地區。我哋會確保呢啲傳輸符合 PDPO 嘅規定。
      </p>

      <h2>11. 政策更改</h2>
      <p>
        我哋可能不時更新本政策。重要變更會喺本網站公告，並可能透過電郵通知你。「最後更新」日期會顯示喺政策頂部。
      </p>

      <h2>12. 聯絡我哋</h2>
      <p>
        對私隱政策有任何問題，請聯絡：
      </p>
      <ul>
        <li>電郵：<a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
        <li>電話：<a href={`tel:${SITE.phone}`}>{SITE.phone}</a></li>
        <li>地址：{SITE.address}</li>
      </ul>

      <hr />

      <p className="text-[12px] text-brand-softer">
        <em>
          本私隱政策為一般性說明，並非法律建議。如有特殊情況或法律疑問，請諮詢專業律師。
        </em>
      </p>
    </LegalLayout>
  );
}
