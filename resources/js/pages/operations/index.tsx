import { Form, Head, Link, router } from '@inertiajs/react';
import { Download, Plus, Printer, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type RecordItem = {
    id: number;
    title: string;
    category: string | null;
    status: string;
    starts_at: string | null;
    ends_at: string | null;
    amount: string | null;
    description: string | null;
    notes: string | null;
    assignee: { name: string } | null;
};
type Member = { id: number; name: string };
const labels: Record<string, string> = {
    projects: 'Project Kanban',
    awards: 'Awards & Recognition',
    meetings: 'Meetings, Agendas & Minutes',
    assets: 'Asset Management',
    payables: 'Payables',
    receivables: 'Receivables',
    reminders: 'Reminders',
};
const statuses = [
    'open',
    'planned',
    'in_progress',
    'completed',
    'cancelled',
    'paid',
    'recognized',
];

export default function Operations({
    module,
    records,
    members,
    canManage,
}: {
    module: string;
    records: RecordItem[];
    members: Member[];
    canManage: boolean;
}) {
    const kanban = module === 'projects';

    return (
        <>
            <Head title={labels[module]} />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-8 print:p-0">
                <header className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {labels[module]}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Managed records, exports, and permanent activity
                            audit.
                        </p>
                    </div>
                    <div className="flex gap-2 print:hidden">
                        <Button variant="outline" asChild>
                            <a href={`/operations/${module}/export`}>
                                <Download />
                                Export CSV
                            </a>
                        </Button>
                        {module === 'meetings' && (
                            <Button
                                variant="outline"
                                onClick={() => window.print()}
                            >
                                <Printer />
                                Print
                            </Button>
                        )}
                    </div>
                </header>
                {canManage && (
                    <Form
                        action={`/operations/${module}`}
                        method="post"
                        className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4 print:hidden"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div>
                                    <Input
                                        name="title"
                                        placeholder="Title"
                                        required
                                    />
                                    <small className="text-destructive">
                                        {errors.title}
                                    </small>
                                </div>
                                <Input
                                    name="category"
                                    placeholder="Category / control no."
                                />
                                <select
                                    name="status"
                                    className="h-9 rounded-md border bg-background px-3"
                                >
                                    {statuses.map((s) => (
                                        <option key={s} value={s}>
                                            {s.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    name="assigned_to"
                                    className="h-9 rounded-md border bg-background px-3"
                                >
                                    <option value="">
                                        Unassigned / external
                                    </option>
                                    {members.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.name}
                                        </option>
                                    ))}
                                </select>
                                <Input name="starts_at" type="datetime-local" />
                                <Input name="ends_at" type="datetime-local" />
                                <Input
                                    name="amount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Amount"
                                />
                                <Input
                                    name="description"
                                    placeholder={
                                        module === 'meetings'
                                            ? 'Agenda'
                                            : 'Description'
                                    }
                                />
                                <textarea
                                    name="notes"
                                    placeholder={
                                        module === 'meetings'
                                            ? 'Minutes'
                                            : 'Notes'
                                    }
                                    className="min-h-20 rounded-md border bg-background p-2 md:col-span-3"
                                />
                                <Button disabled={processing}>
                                    <Plus />
                                    Create
                                </Button>
                            </>
                        )}
                    </Form>
                )}
                {kanban ? (
                    <div className="grid gap-4 lg:grid-cols-3">
                        {['planned', 'in_progress', 'completed'].map(
                            (status) => (
                                <section
                                    key={status}
                                    className="rounded-xl border bg-muted/20 p-3"
                                >
                                    <h2 className="mb-3 font-semibold capitalize">
                                        {status.replace('_', ' ')}
                                    </h2>
                                    <div className="space-y-3">
                                        {records
                                            .filter((r) => r.status === status)
                                            .map((r) => (
                                                <Card
                                                    key={r.id}
                                                    item={r}
                                                    module={module}
                                                    canManage={canManage}
                                                />
                                            ))}
                                    </div>
                                </section>
                            ),
                        )}
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {records.map((r) => (
                            <Card
                                key={r.id}
                                item={r}
                                module={module}
                                canManage={canManage}
                            />
                        ))}
                    </div>
                )}
            </main>
        </>
    );
}
function Card({
    item,
    module,
    canManage,
}: {
    item: RecordItem;
    module: string;
    canManage: boolean;
}) {
    return (
        <article className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex justify-between gap-3">
                <div>
                    <h3 className="font-semibold">
                        {module === 'meetings' ? (
                            <Link
                                className="text-[#17458f] hover:underline"
                                href={`/meetings/${item.id}`}
                            >
                                {item.title}
                            </Link>
                        ) : (
                            item.title
                        )}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {item.category || 'Uncategorized'} ·{' '}
                        {item.assignee?.name || 'Unassigned'}{' '}
                        {item.starts_at &&
                            `· ${new Date(item.starts_at).toLocaleString('en-PH')}`}
                    </p>
                </div>
                {item.amount && (
                    <strong>
                        ₱
                        {Number(item.amount).toLocaleString('en-PH', {
                            minimumFractionDigits: 2,
                        })}
                    </strong>
                )}
            </div>
            {item.description && (
                <div className="mt-3 text-sm whitespace-pre-wrap">
                    <b>{module === 'meetings' ? 'Agenda: ' : ''}</b>
                    {item.description}
                </div>
            )}
            {item.notes && (
                <div className="mt-3 rounded bg-muted p-3 text-sm whitespace-pre-wrap">
                    <b>{module === 'meetings' ? 'Minutes: ' : ''}</b>
                    {item.notes}
                </div>
            )}
            {canManage && (
                <div className="mt-3 flex items-center gap-2 print:hidden">
                    <select
                        value={item.status}
                        onChange={(e) =>
                            router.patch(
                                `/operations/${module}/${item.id}`,
                                {
                                    status: e.target.value,
                                    notes: item.notes || '',
                                },
                                { preserveScroll: true },
                            )
                        }
                        className="h-8 rounded border bg-background px-2 text-xs"
                    >
                        {statuses.map((s) => (
                            <option key={s}>{s}</option>
                        ))}
                    </select>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                            confirm('Delete this record?') &&
                            router.delete(`/operations/${module}/${item.id}`, {
                                preserveScroll: true,
                            })
                        }
                    >
                        <Trash2 />
                    </Button>
                </div>
            )}
        </article>
    );
}
