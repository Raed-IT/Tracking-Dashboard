import type { Language } from "./translations";

export const pageText: Record<Language, {
  tracks: { title: string; description: string };
  sources: { title: string; description: string };
  alerts: { title: string; description: string };
  users: { title: string; description: string };
  settings: { title: string; description: string };
}> = {
  en: {
    tracks: { title: "Live tracks", description: "Monitor aircraft positions and telemetry in real time." },
    sources: { title: "Data sources", description: "Manage connected ADS-B and telemetry feeds." },
    alerts: { title: "Alerts", description: "Review operational events and flight anomalies." },
    users: { title: "Users", description: "Manage operators, roles and access." },
    settings: { title: "Settings", description: "Configure workspace and application preferences." },
  },
  ar: {
    tracks: { title: "التتبع المباشر", description: "مراقبة مواقع الطائرات وبياناتها لحظياً." },
    sources: { title: "مصادر البيانات", description: "إدارة مصادر ADS-B ومصادر بيانات التتبع المتصلة." },
    alerts: { title: "التنبيهات", description: "مراجعة الأحداث التشغيلية وحالات الطيران غير الطبيعية." },
    users: { title: "المستخدمون", description: "إدارة المشغلين والأدوار والصلاحيات." },
    settings: { title: "الإعدادات", description: "إعداد مساحة العمل وتفضيلات التطبيق." },
  },
};
