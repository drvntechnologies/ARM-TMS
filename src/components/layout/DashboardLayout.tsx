import { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AppLayout from '@cloudscape-design/components/app-layout';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import TopNavigation from '@cloudscape-design/components/top-navigation';
import { FileText, FileCheck, Users, Truck, Gift, Package, BarChart3, Settings, CircleUser as UserCircle, Shield, Lock, Truck as TruckIcon, Key, Search, Calculator, Database } from 'lucide-react';

export default function DashboardLayout() {
  const [navigationOpen, setNavigationOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    { type: 'link', text: 'Quotes', href: '/dashboard/quotes' },
    { type: 'link', text: 'Customer Quotes', href: '/dashboard/customer-quotes' },
    { type: 'link', text: 'Orders', href: '/dashboard/orders' },
    { type: 'link', text: 'Customer Management', href: '/dashboard/customers' },
    { type: 'link', text: 'Carriers', href: '/dashboard/carriers' },
    {
      type: 'section',
      text: 'MLB Transport',
      items: [
        { type: 'link', text: 'MLB Transport', href: '/dashboard/mlb-transport' },
        { type: 'link', text: 'MLB Order Lookup', href: '/dashboard/mlb-transport/order-lookup' },
      ]
    },
    {
      type: 'section',
      text: 'D1 Relocation',
      items: [
        { type: 'link', text: 'D1 Relocation Lookup', href: '/dashboard/d1-relocation/order-lookup' },
      ]
    },
    { type: 'link', text: 'Consumer Order Lookup', href: '/dashboard/d1-relocation/consumer-lookup' },
    { type: 'link', text: 'Referral Management', href: '/dashboard/referrals' },
    { type: 'link', text: 'Vendors', href: '/dashboard/vendors' },
    { type: 'link', text: 'Reports', href: '/dashboard/reports' },
    { type: 'divider' },
    {
      type: 'section',
      text: 'Configuration and Settings',
      items: [
        { type: 'link', text: 'API Access', href: '/dashboard/api-access' },
        { type: 'link', text: 'Pricing Engines', href: '/dashboard/pricing-engines' },
        { type: 'link', text: 'API Keys', href: '/dashboard/api-keys' },
        { type: 'link', text: 'Pricing Analytics', href: '/dashboard/pricing-analytics' },
        { type: 'link', text: 'Settings', href: '/dashboard/settings' },
        { type: 'link', text: 'User Management', href: '/dashboard/users' },
        { type: 'link', text: 'User Roles', href: '/dashboard/roles' },
        { type: 'link', text: 'Access Control List', href: '/dashboard/acl' },
      ]
    },
  ];

  return (
    <div>
      <TopNavigation
        identity={{
          href: '/dashboard',
          title: 'Auto Relocation Management',
          logo: {
            src: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNyAxNkM1LjM0IDE2IDQgMTQuNjYgNCAxM0M0IDExLjM0IDUuMzQgMTAgNyAxMEM4LjY2IDEwIDEwIDExLjM0IDEwIDEzQzEwIDE0LjY2IDguNjYgMTYgNyAxNlpNMTcgMTZDMTUuMzQgMTYgMTQgMTQuNjYgMTQgMTNDMTQgMTEuMzQgMTUuMzQgMTAgMTcgMTBDMTguNjYgMTAgMjAgMTEuMzQgMjAgMTNDMjAgMTQuNjYgMTguNjYgMTYgMTcgMTZaTTE4LjkyIDZDMTguNzIgNS40MiAxOC4xNiA1IDE3LjUgNUg5QzguNCD1IDggNS40IDggNlYxMkgyMFY4TDE4LjkyIDZaTTYgMTlWMTdINFYxMEMyIDEwIDIgMTAgMiAxMkwxLjk5IDE1SDRWMTlINlpNMjAgMTdWMTlIMThWMTVIMjBWMTdaIiBmaWxsPSIjMDA3QUNDII8vc3ZnPg==',
            alt: 'Auto Relocation'
          }
        }}
        utilities={[
          {
            type: 'menu-dropdown',
            text: profile?.full_name || profile?.email || 'User',
            description: profile?.email,
            iconName: 'user-profile',
            items: [
              {
                id: 'profile',
                text: 'Profile',
                href: '/dashboard/profile'
              },
              {
                id: 'signout',
                text: 'Sign out'
              }
            ],
            onItemClick: ({ detail }) => {
              if (detail.id === 'signout') {
                handleSignOut();
              } else if (detail.id === 'profile') {
                navigate('/dashboard/profile');
              }
            }
          }
        ]}
        i18nStrings={{
          searchIconAriaLabel: 'Search',
          searchDismissIconAriaLabel: 'Close search',
          overflowMenuTriggerText: 'More',
          overflowMenuTitleText: 'All'
        }}
      />
      <AppLayout
        navigation={
          <SideNavigation
            activeHref={location.pathname}
            items={navItems}
            onFollow={(event) => {
              event.preventDefault();
              navigate(event.detail.href);
            }}
          />
        }
        navigationOpen={navigationOpen}
        onNavigationChange={({ detail }) => setNavigationOpen(detail.open)}
        content={<Outlet />}
        toolsHide={true}
        ariaLabels={{
          navigation: 'Side navigation',
          navigationClose: 'Close navigation',
          navigationToggle: 'Toggle navigation'
        }}
      />
    </div>
  );
}
