export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  children?: NavItem[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};
