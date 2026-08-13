import type { NavGroup, NavItem } from "@/types/navigation";

export const mainNavigation: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "About Us",
    href: "#",
    children: [
      { label: "Our Mission", href: "/our-mission" },
      { label: "Our Committee", href: "/our-members" },
      { label: "Members Portal", href: "/adminpanel" },
    ],
  },
  {
    label: "Our Services",
    href: "#",
    children: [
      { label: "Funeral services", href: "/Funeral-services" },
      { label: "MASOM Islamic School", href: "/MIS" },
      { label: "Matrimonial services", href: "#" },
      { label: "Youth Activities", href: "/youth-activities" },
      { label: "Wadi-e-MASOM", href: "/Wadi-e-MASOM" },
      { label: "MASOM Online Shop", href: "#" },
    ],
  },
  {
    label: "Events",
    href: "#",
    children: [
      { label: "Hijri Prayer Calendar", href: "/hijricalendar2026" },
      { label: "Program Calendar", href: "/events-schedule" },
    ],
  },
  {
    label: "Online Forms",
    href: "/forms",
    children: [
      { label: "Online Forms", href: "/forms" },
      { label: "Membership Form", href: "#" },
      { label: "Application for Private Program", href: "#" },
      { label: "Sura-Fatiha Request", href: "#" },
    ],
  },
  {
    label: "Multimedia",
    href: "#",
    children: [
      { label: "Photo Gallery", href: "/photo-gallery" },
      { label: "Videos", href: "/videos" },
    ],
  },
  { label: "Contact Us", href: "/contacts" },
];

export const footerNavigation: NavGroup[] = [
  {
    title: "Administration",
    items: [
      { label: "Our Mission", href: "/our-mission" },
      { label: "Our Executive Committee", href: "/our-members" },
      {
        label: "Our Constitution",
        href: "https://masom.com/org/masomByLaws.pdf",
        external: true,
      },
      { label: "MASOM Islamic School", href: "/MIS" },
      { label: "Online Forms", href: "/forms" },
    ],
  },
  {
    title: "Useful Links",
    items: [
      { label: "Hijri Prayer Calendar", href: "/hijricalendar2026" },
      { label: "Program Calendar", href: "/events-schedule" },
      { label: "Sura-Fatiha Request", href: "/Sura-Fatiha" },
      { label: "Multimedia", href: "#" },
      { label: "Contact Us", href: "/contacts" },
    ],
  },
];
