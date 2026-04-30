import { adminDb } from "@/lib/firebase/admin";
import { serializeDate } from "@/lib/serialize";
import type { TeamMember } from "@/types";

const DEFAULT_FOUNDERS: TeamMember[] = [
  {
    id: "kenneth-yung",
    name: "Kenneth YUNG",
    nameEn: "Kenneth YUNG",
    title: "共同創辦人 Co-Founder",
    bio: "擁有豐富的多元化商業實踐經驗，涵蓋國際貿易、跨境市集策劃、娛樂產業、廣告策劃、生產管理及飲食業等領域。曾成功接管虧損工廠並轉型為年收入逾 1.2 億港元的企業，亦與韓國連鎖餐廳創下全球最高營業額紀錄。",
    orderIndex: 1,
    isVisible: true,
  },
  {
    id: "alfred-mu",
    name: "Alfred MU",
    nameEn: "Alfred MU",
    title: "共同創辦人 Co-Founder",
    bio: "擁有工商管理博士（DBA）、MBA、環境管理及工程學碩士、市場營銷學理學碩士等學歷。在家族企業成功推動管理模式從個人化轉型為企業化，帶動公司規模及生意額實現 15 倍增長。",
    orderIndex: 2,
    isVisible: true,
  },
  {
    id: "heidi-lai",
    name: "Heidi LAI",
    nameEn: "Heidi LAI",
    title: "共同創辦人 Co-Founder",
    bio: "擁有工商管理（會議及活動管理）高級文憑及酒店與旅遊管理榮譽學士學位，擁有十餘年活動管理及市場推廣經驗。曾協助國際連鎖餐廳進軍香港市場，三個月內帶領團隊創下每月逾 200 萬港元營業額，並於短時間內拓展至五間分店。",
    orderIndex: 3,
    isVisible: true,
  },
  {
    id: "jacky-yeung",
    name: "Jacky YEUNG",
    nameEn: "Jacky YEUNG",
    title: "共同創辦人 Co-Founder",
    bio: "澳洲註冊會計師（CPA Australia），擁有澳洲管理會計師資格，為華人會計師公會附屬會員及香港稅務學會會員。曾任職於四大會計師事務所，對中小型企業及上市公司的會計、審計及稅務有深入理解。",
    orderIndex: 4,
    isVisible: true,
  },
];

export async function getVisibleTeamMembers(): Promise<TeamMember[]> {
  try {
    const snap = await adminDb()
      .collection("teamMembers")
      .where("isVisible", "==", true)
      .orderBy("orderIndex", "asc")
      .get();
    if (snap.empty) return DEFAULT_FOUNDERS;
    return snap.docs.map((d) => {
      const data = d.data() ?? {};
      return {
        id: d.id,
        name: data.name ?? "",
        nameEn: data.nameEn ?? undefined,
        title: data.title ?? "",
        bio: data.bio ?? undefined,
        photoUrl: data.photoUrl ?? undefined,
        orderIndex: data.orderIndex ?? 99,
        isVisible: data.isVisible ?? true,
        createdAt: serializeDate(data.createdAt) ?? undefined,
        updatedAt: serializeDate(data.updatedAt) ?? undefined,
      } as TeamMember;
    });
  } catch (err) {
    console.warn("[getVisibleTeamMembers] falling back to defaults:", err);
    return DEFAULT_FOUNDERS;
  }
}
