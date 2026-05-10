export const SITE = {
  name: "創研社 CREATE HUB",
  nameEn: "CREATE HUB",
  tagline: "學以致用，創出未來",
  description:
    "創研社（CREATE HUB）是一個集合豐富營商經驗的老闆及專業團隊的教育平台。我們致力通過線上課程及線下活動，為有志提升商業知識的人士提供實用、貼地的學習體驗，助您掌握市場趨勢，創出屬於自己的成功故事。",
  email: "info@createhub.biz",
  phone: "+852 9691 6190",
  whatsapp: "+85296916190",
  address: "Lai Chi Kok, Hong Kong",
  learnworldsUrl:
    process.env.NEXT_PUBLIC_LEARNWORLDS_URL ||
    "https://createhub.learnworlds.com/home",
  social: {
    facebook: "https://www.facebook.com/profile.php?id=61576945907548",
    instagram: "https://www.instagram.com/createhub.hk",
    youtube: "https://www.youtube.com/@CreateHub-hk",
    whatsapp: "https://wa.me/85296916190",
  },
  venue: {
    name: "Link Hub",
    url: "https://link-hub.biz",
    address: "九龍荔枝角永康街 29-33 號兆威工業大廈 1 樓 01 室",
    whatsapp: "https://wa.me/85296916190",
    phone: "+852 9691 6190",
  },
};

export type NavLink = {
  href: string;
  label: string;
  external?: boolean;
  conditional?: "hasNews";
};

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "主頁" },
  { href: SITE.learnworldsUrl, label: "線上學習平台", external: true },
  { href: "/events", label: "活動" },
  { href: "/news", label: "商業快訊", conditional: "hasNews" },
  { href: "/venue", label: "場地租用" },
  { href: "/about", label: "關於我們" },
  { href: "/contact", label: "聯絡我們" },
];
