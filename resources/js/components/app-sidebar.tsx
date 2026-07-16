import { Link, usePage } from '@inertiajs/react';
import {
    Award,
    CalendarDays,
    FolderKanban,
    LayoutGrid,
    Landmark,
    ClipboardList,
    ScrollText,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import members from '@/routes/members';
import finance from '@/routes/finance';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    { title: 'Members', href: members.index(), icon: Users },
    { title: 'Finance', href: finance.index(), icon: Landmark },
    { title: 'Projects', href: '/operations/projects', icon: FolderKanban },
    { title: 'Attendance', href: '/attendance', icon: CalendarDays },
    { title: 'Awards', href: '/operations/awards', icon: Award },
    { title: 'Meetings', href: '/operations/meetings', icon: ClipboardList },
    { title: 'Assets', href: '/operations/assets', icon: Landmark },
    { title: 'Payables', href: '/operations/payables', icon: Landmark },
    { title: 'Receivables', href: '/operations/receivables', icon: Landmark },
    { title: 'Reminders', href: '/operations/reminders', icon: CalendarDays },
    { title: 'Audit', href: '/audit', icon: ScrollText },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage().props;
    const visibleItems = mainNavItems.filter(
        (item) =>
            (item.title !== 'Members' || auth.user.can_manage_members) &&
            (item.title !== 'Finance' || auth.user.can_view_finance) &&
            (item.title !== 'Audit' || auth.user.can_view_audit) &&
            (![
                'Projects',
                'Attendance',
                'Awards',
                'Meetings',
                'Assets',
                'Payables',
                'Receivables',
                'Reminders',
            ].includes(item.title) ||
                auth.user.can_view_operations),
    );

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={visibleItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
