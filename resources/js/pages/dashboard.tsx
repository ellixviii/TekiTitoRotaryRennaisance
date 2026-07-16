import { Head } from '@inertiajs/react';
import {
    Award,
    CalendarDays,
    FolderKanban,
    Landmark,
    Users,
} from 'lucide-react';
import { dashboard } from '@/routes';

const modules = [
    {
        title: 'Members',
        description: 'Profiles, reminders, and records',
        icon: Users,
    },
    {
        title: 'Finance',
        description: 'Transactions, ledgers, and reports',
        icon: Landmark,
    },
    {
        title: 'Projects',
        description: 'Kanban boards and assignments',
        icon: FolderKanban,
    },
    {
        title: 'Attendance',
        description: 'Events, guests, and NFC check-in',
        icon: CalendarDays,
    },
    {
        title: 'Awards',
        description: 'Recognition, categories, and events',
        icon: Award,
    },
];

export default function Dashboard() {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <section className="overflow-hidden rounded-2xl bg-[#17458f] p-6 text-white md:p-8">
                    <p className="text-sm font-medium text-[#f7a81b]">
                        Create lasting impact
                    </p>
                    <h1 className="mt-2 text-2xl font-semibold md:text-3xl">
                        Welcome to Rotary Renaissance
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm text-blue-100">
                        Your secure workspace for club operations and member
                        service.
                    </p>
                </section>
                <section aria-labelledby="modules-heading">
                    <h2 id="modules-heading" className="text-lg font-semibold">
                        Club modules
                    </h2>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {modules.map(({ title, description, icon: Icon }) => (
                            <article
                                key={title}
                                className="rounded-xl border bg-card p-5 shadow-sm"
                            >
                                <Icon
                                    className="size-6 text-[#17458f]"
                                    aria-hidden="true"
                                />
                                <h3 className="mt-4 font-semibold">{title}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {description}
                                </p>
                                <span className="mt-4 inline-block text-xs font-medium text-[#17458f]">
                                    Coming in the next build phase
                                </span>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: dashboard() }],
};
