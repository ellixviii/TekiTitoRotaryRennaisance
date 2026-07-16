import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FolderKanban,
    Landmark,
    RefreshCw,
    Search,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard } from '@/routes';

type Stat = { label: string; value: number | string; href: string };
type Alert = { label: string; count: number; href: string };
type Project = {
    id: number;
    title: string;
    status: string;
    beneficiaries_target: number | null;
    beneficiaries_actual: number | null;
    assignee: { name: string } | null;
};
type Upcoming = {
    id: number;
    module: string;
    title: string;
    starts_at: string;
};
type Permissions = {
    members: boolean;
    finance: boolean;
    operations: boolean;
    manageOperations: boolean;
    audit: boolean;
};

const modules = [
    {
        title: 'Members',
        description: 'Profiles, invitations, statements',
        icon: Users,
        href: '/members',
        permission: 'members',
    },
    {
        title: 'Finance',
        description: 'Journals, approvals, reports',
        icon: Landmark,
        href: '/finance',
        permission: 'finance',
    },
    {
        title: 'Projects',
        description: 'Kanban, impact, service hours',
        icon: FolderKanban,
        href: '/operations/projects',
        permission: 'operations',
    },
    {
        title: 'Attendance',
        description: 'Events, guests, RFID/NFC',
        icon: CalendarDays,
        href: '/attendance',
        permission: 'manageOperations',
    },
    {
        title: 'Mission',
        description: 'Outcomes, handover, engagement',
        icon: CheckCircle2,
        href: '/mission',
        permission: 'operations',
    },
] as const;

export default function Dashboard({
    days,
    manilaTime,
    stats,
    attention,
    projects,
    upcoming,
    permissions,
}: {
    days: number;
    manilaTime: string;
    stats: Stat[];
    attention: Alert[];
    projects: Project[];
    upcoming: Upcoming[];
    permissions: Permissions;
}) {
    const { auth } = usePage().props;
    const [search, setSearch] = useState('');
    const visibleModules = useMemo(
        () =>
            modules.filter(
                (m) =>
                    permissions[m.permission] &&
                    m.title.toLowerCase().includes(search.toLowerCase()),
            ),
        [permissions, search],
    );
    const changePeriod = (value: number) =>
        router.get(
            '/dashboard',
            { days: value },
            { preserveState: true, preserveScroll: true, replace: true },
        );

    return (
        <>
            <Head title="Dashboard" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <section className="overflow-hidden rounded-2xl bg-[#17458f] p-6 text-white md:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-medium text-[#f7a81b]">
                                Create lasting impact
                            </p>
                            <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
                                Welcome, {auth.user.name}
                            </h1>
                            <p className="mt-2 text-sm text-blue-100">
                                Live club overview · Manila time: {manilaTime}
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            onClick={() => router.reload()}
                        >
                            <RefreshCw />
                            Refresh
                        </Button>
                    </div>
                </section>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex rounded-lg border bg-card p-1">
                        {[30, 90, 365].map((value) => (
                            <button
                                key={value}
                                onClick={() => changePeriod(value)}
                                className={`rounded-md px-3 py-1.5 text-sm ${days === value ? 'bg-[#17458f] text-white' : 'hover:bg-muted'}`}
                            >
                                {value === 365 ? '1 year' : `${value} days`}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Find a module"
                            className="pl-9"
                        />
                    </div>
                </div>

                <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {stats.map((stat) => (
                        <Link
                            key={stat.label}
                            href={stat.href}
                            className="rounded-xl border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-[#17458f]"
                        >
                            <p className="text-xs text-muted-foreground">
                                {stat.label} · {days}d
                            </p>
                            <strong className="mt-2 block text-2xl text-[#17458f]">
                                {format(stat.value)}
                            </strong>
                        </Link>
                    ))}
                </section>

                {attention.length > 0 && (
                    <section className="rounded-xl border border-amber-300 bg-amber-50 p-4 dark:bg-amber-950/20">
                        <h2 className="flex items-center gap-2 font-semibold">
                            <AlertTriangle className="size-5 text-amber-600" />
                            Needs attention
                        </h2>
                        <div className="mt-3 grid gap-2 md:grid-cols-3">
                            {attention.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="flex items-center justify-between rounded-lg bg-background p-3 text-sm hover:ring-1 hover:ring-amber-500"
                                >
                                    <span>{item.label}</span>
                                    <b>{item.count}</b>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                <section>
                    <h2 className="text-lg font-semibold">Club modules</h2>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleModules.map(
                            ({ title, description, icon: Icon, href }) => (
                                <Link
                                    key={title}
                                    href={href}
                                    className="group rounded-xl border bg-card p-5 shadow-sm transition hover:border-[#17458f]"
                                >
                                    <div className="flex items-start justify-between">
                                        <Icon className="size-6 text-[#17458f]" />
                                        <ArrowRight className="size-4 opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" />
                                    </div>
                                    <h3 className="mt-4 font-semibold">
                                        {title}
                                    </h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {description}
                                    </p>
                                </Link>
                            ),
                        )}
                    </div>
                    {visibleModules.length === 0 && (
                        <p className="mt-3 rounded border p-4 text-sm text-muted-foreground">
                            No accessible modules match “{search}”.
                        </p>
                    )}
                </section>

                {permissions.operations && (
                    <div className="grid gap-6 xl:grid-cols-2">
                        <section className="rounded-xl border bg-card p-5">
                            <h2 className="flex items-center gap-2 font-semibold">
                                <FolderKanban className="size-5 text-[#17458f]" />
                                Project progress
                            </h2>
                            <div className="mt-4 space-y-4">
                                {projects.map((project) => {
                                    const percent = project.beneficiaries_target
                                        ? Math.min(
                                              100,
                                              Math.round(
                                                  ((project.beneficiaries_actual ||
                                                      0) /
                                                      project.beneficiaries_target) *
                                                      100,
                                              ),
                                          )
                                        : 0;

                                    return (
                                        <Link
                                            href="/mission"
                                            key={project.id}
                                            className="block"
                                        >
                                            <div className="flex justify-between gap-3 text-sm">
                                                <span>
                                                    <b>{project.title}</b>
                                                    <small className="ml-2 text-muted-foreground">
                                                        {project.assignee
                                                            ?.name ||
                                                            'Unassigned'}
                                                    </small>
                                                </span>
                                                <span>
                                                    {project.beneficiaries_target
                                                        ? `${percent}%`
                                                        : project.status.replace(
                                                              '_',
                                                              ' ',
                                                          )}
                                                </span>
                                            </div>
                                            <div className="mt-2 h-2 overflow-hidden rounded bg-muted">
                                                <div
                                                    className="h-full bg-[#17458f]"
                                                    style={{
                                                        width: `${percent}%`,
                                                    }}
                                                />
                                            </div>
                                        </Link>
                                    );
                                })}
                                {projects.length === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No projects recorded yet.
                                    </p>
                                )}
                            </div>
                        </section>
                        <section className="rounded-xl border bg-card p-5">
                            <h2 className="flex items-center gap-2 font-semibold">
                                <Clock3 className="size-5 text-[#17458f]" />
                                Upcoming
                            </h2>
                            <div className="mt-4 divide-y">
                                {upcoming.map((item) => (
                                    <Link
                                        href={
                                            item.module === 'attendance'
                                                ? `/attendance/${item.id}`
                                                : `/operations/${item.module}`
                                        }
                                        key={item.id}
                                        className="flex items-center justify-between gap-3 py-3 text-sm hover:text-[#17458f]"
                                    >
                                        <span>
                                            <b>{item.title}</b>
                                            <small className="ml-2 text-muted-foreground capitalize">
                                                {item.module}
                                            </small>
                                        </span>
                                        <time>
                                            {new Date(
                                                item.starts_at,
                                            ).toLocaleDateString('en-PH', {
                                                month: 'short',
                                                day: 'numeric',
                                            })}
                                        </time>
                                    </Link>
                                ))}
                                {upcoming.length === 0 && (
                                    <p className="py-3 text-sm text-muted-foreground">
                                        Nothing scheduled.
                                    </p>
                                )}
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </>
    );
}
function format(value: number | string) {
    const n = Number(value);

    return Number.isInteger(n)
        ? n.toLocaleString('en-PH')
        : n.toLocaleString('en-PH', { maximumFractionDigits: 2 });
}
Dashboard.layout = { breadcrumbs: [{ title: 'Dashboard', href: dashboard() }] };
