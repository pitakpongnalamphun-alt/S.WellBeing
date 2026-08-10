/**
 * School locations, shared by แจ้งเหตุ (/report) and ขอความช่วยเหลือด่วน (/sos)
 * so the two always offer the same places. Zone-based instead of GPS: a student
 * shouldn't have to share their live position. Searchable by Thai or English.
 */
export type Place = { th: string; en: string };
export type PlaceGroup = { label: string; places: Place[] };

export const LOCATION_GROUPS: PlaceGroup[] = [
  {
    label: "ช่องทางอื่น",
    places: [
      { th: "โซเชียลมีเดีย / ออนไลน์", en: "Online / Cyber" },
      { th: "นอกโรงเรียน", en: "Outside School" },
    ],
  },
  {
    label: "อาคารในโรงเรียน",
    places: [
      { th: "อาคารเซนต์คาเบรียล", en: "St.Gabriel Building" },
      { th: "อาคารอิลเดอฟองโซ", en: "Ildefonso Building" },
      { th: "อาคารยอห์นแมรี่", en: "John Mary Building" },
      { th: "ACT ปังนม", en: "ACT Pung Nom" },
      { th: "อาคารเซนต์ปีเตอร์", en: "St.Peter Building" },
      { th: "อาคารบ้านพักภราดา", en: "Brother Residence Building" },
      { th: "หอประชุมหลุยส์ มารี เดอ มงฟอร์ต", en: "Louis Marie De Montfort Hall" },
      { th: "อาคารรัตนบรรณาคาร", en: "Rattanabannakarn Building" },
      { th: "อาคารเซนต์แมรี่", en: "St.Mary Building" },
      { th: "อาคารอัสสัมชัญ", en: "Assumption Building" },
      { th: "อาคารเทิดเทพรัตน์ '36", en: "Therdtheparat '36 Building" },
      { th: "อาคารอเล็กซิส มิวสิค", en: "Alexis Music Building" },
      { th: "อาคารเซนต์แอนดรูว์ 1-2", en: "St.Andrew 1-2 Building" },
      { th: "อาคารเทโอฟาน", en: "Theophane Building" },
      { th: "อาคารโกลเด้นจูบิลี", en: "Golden Jubilee Building" },
      { th: "อาคารลาวสุต", en: "Lavasut Building" },
      { th: "ACT สปอร์ต อารีนา", en: "ACT Sport Arena" },
      { th: "สนามกีฬาองประชานุกูล", en: "Wongprachanukul Stadium" },
      { th: "อาคารเซนต์โยเซฟ", en: "St.Joseph Building" },
      { th: "อาคารราฟาแอล", en: "Raphael Building" },
      { th: "อาคารมาร์ติน", en: "Martin Building" },
      { th: "อาคารซ่อมบำรุง", en: "Maintenance Building" },
      { th: "ศูนย์การเรียนรู้เศรษฐกิจพอเพียง", en: "Learning Center of Sufficiency Economy" },
      { th: "อุทยานกาญจนาภิเษก", en: "Kanchanaphisek Memorial Garden" },
    ],
  },
];
