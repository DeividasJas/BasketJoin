const response = await fetch('/api');
const isAuth: boolean = await response.json();
console.log('Is user authenticated:', isAuth);

export type Links = {
  label: string;
  href?: string;
};
export const navLinks: Links[] = [
  {
    label: 'About',
    href: '/',
  },
  {
    label: 'Schedule',
    href: '/schedule',
  },
  {
    label: 'Status',
    href: '/status',
  },
  {
    label: 'Profile',
    href: '/profile',
  },
  {
    label: 'Login',
  },
  {
    label: 'Signup',
  },
  // {
  //   label: 'Logout',
  //   href: '/logout',
  //   show: isAuth === true,
  // },
];
