import { Head, Link } from '@inertiajs/react';
import { BarChart3, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import finance from '@/routes/finance';

type Journal = {
    id: number;
    reference: string;
    entry_date: string;
    type: string;
    description: string;
    status: string;
    party_name: string | null;
    lines: { debit: string; credit: string }[];
    preparer: { name: string };
};
type LinkItem = { url: string | null; label: string; active: boolean };

export default function FinanceIndex({
    journals,
    canCreate,
}: {
    journals: { data: Journal[]; links: LinkItem[]; total: number };
    canCreate: boolean;
}) {
    return (
        <>
            <Head title="Finance" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Financial management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Balanced journals, approvals, posting, and reports.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href={finance.incomeStatement()}>
                                <BarChart3 /> Income statement
                            </Link>
                        </Button>
                        {canCreate && (
                            <Button asChild>
                                <Link href={finance.create()}>
                                    <Plus /> New entry
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>
                <div className="overflow-hidden rounded-xl border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3">Reference</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3">Description</th>
                                    <th className="px-4 py-3 text-right">
                                        Amount
                                    </th>
                                    <th className="px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {journals.data.map((journal) => (
                                    <tr
                                        key={journal.id}
                                        className="hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3 font-medium">
                                            <Link
                                                href={finance.show(journal.id)}
                                                className="text-[#17458f] hover:underline"
                                            >
                                                {journal.reference}
                                            </Link>
                                            <span className="block text-xs font-normal text-muted-foreground capitalize">
                                                {journal.type}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {journal.entry_date.slice(0, 10)}
                                        </td>
                                        <td className="max-w-md px-4 py-3">
                                            <span className="line-clamp-1">
                                                {journal.description}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {journal.party_name ||
                                                    'No party'}{' '}
                                                · {journal.preparer.name}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">
                                            {money(
                                                journal.lines.reduce(
                                                    (sum, line) =>
                                                        sum +
                                                        Number(line.debit),
                                                    0,
                                                ),
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Status status={journal.status} />
                                        </td>
                                    </tr>
                                ))}
                                {journals.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="px-4 py-12 text-center text-muted-foreground"
                                        >
                                            No journal entries yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex justify-end gap-1 border-t p-3">
                        {journals.links.map(
                            (link) =>
                                link.url && (
                                    <Link
                                        key={link.label}
                                        href={link.url}
                                        className={`rounded px-3 py-1 text-sm ${link.active ? 'bg-[#17458f] text-white' : 'hover:bg-muted'}`}
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                ),
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

function money(value: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(value);
}
function Status({ status }: { status: string }) {
    const color =
        status === 'posted'
            ? 'bg-emerald-100 text-emerald-700'
            : status === 'reversed'
              ? 'bg-slate-100 text-slate-600'
              : status === 'approved'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-amber-100 text-amber-700';

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${color}`}
        >
            {status}
        </span>
    );
}
FinanceIndex.layout = {
    breadcrumbs: [{ title: 'Finance', href: finance.index() }],
};
