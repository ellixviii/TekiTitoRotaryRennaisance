import { Form, Head, Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, RotateCcw, Send, Stamp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import finance from '@/routes/finance';

type Line = {
    id: number;
    debit: string;
    credit: string;
    memo: string | null;
    account: { code: string; name: string };
};
type Journal = {
    id: number;
    reference: string;
    entry_date: string;
    type: string;
    document_number: string | null;
    party_name: string | null;
    description: string;
    status: string;
    posted_at: string | null;
    lines: Line[];
    preparer: { name: string };
    approver: { name: string } | null;
    member: { name: string } | null;
    bank: { name: string; account_name: string } | null;
};
export default function FinanceShow({
    journal,
    permissions,
}: {
    journal: Journal;
    permissions: {
        submit: boolean;
        approve: boolean;
        post: boolean;
        reverse: boolean;
    };
}) {
    const total = journal.lines.reduce(
        (sum, line) => sum + Number(line.debit),
        0,
    );

    return (
        <>
            <Head title={journal.reference} />
            <div className="mx-auto w-full max-w-5xl p-4 md:p-8">
                <Link
                    href={finance.index()}
                    className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    Back to finance
                </Link>
                <div className="rounded-2xl border bg-card shadow-sm">
                    <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row">
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold">
                                    {journal.reference}
                                </h1>
                                <Status status={journal.status} />
                            </div>
                            <p className="mt-2 text-sm text-muted-foreground capitalize">
                                {journal.type} ·{' '}
                                {journal.entry_date.slice(0, 10)}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {journal.status === 'draft' &&
                                permissions.submit && (
                                    <Action
                                        route={finance.submit.form(journal.id)}
                                        label="Submit"
                                        icon={Send}
                                    />
                                )}{' '}
                            {journal.status === 'submitted' &&
                                permissions.approve && (
                                    <Action
                                        route={finance.approve.form(journal.id)}
                                        label="Approve"
                                        icon={CheckCircle2}
                                    />
                                )}{' '}
                            {journal.status === 'approved' &&
                                permissions.post && (
                                    <Action
                                        route={finance.post.form(journal.id)}
                                        label="Post"
                                        icon={Stamp}
                                    />
                                )}{' '}
                            {journal.status === 'posted' &&
                                permissions.reverse && (
                                    <Action
                                        route={finance.reverse.form(journal.id)}
                                        label="Reverse"
                                        icon={RotateCcw}
                                        destructive
                                    />
                                )}
                        </div>
                    </div>
                    <div className="grid gap-6 p-6 md:grid-cols-3">
                        <Info label="Description" value={journal.description} />
                        <Info
                            label="Party"
                            value={
                                journal.member?.name ||
                                journal.party_name ||
                                '—'
                            }
                        />
                        <Info
                            label="Document number"
                            value={journal.document_number || '—'}
                        />
                        <Info
                            label="Bank"
                            value={
                                journal.bank
                                    ? `${journal.bank.name} — ${journal.bank.account_name}`
                                    : '—'
                            }
                        />
                        <Info
                            label="Prepared by"
                            value={journal.preparer.name}
                        />
                        <Info
                            label="Approved by"
                            value={journal.approver?.name || 'Pending'}
                        />
                    </div>
                    <div className="overflow-x-auto border-t">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left">
                                <tr>
                                    <th className="px-6 py-3">Account</th>
                                    <th className="px-6 py-3 text-right">
                                        Debit
                                    </th>
                                    <th className="px-6 py-3 text-right">
                                        Credit
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {journal.lines.map((line) => (
                                    <tr key={line.id}>
                                        <td className="px-6 py-3">
                                            <span className="font-mono text-xs text-muted-foreground">
                                                {line.account.code}
                                            </span>{' '}
                                            {line.account.name}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono">
                                            {Number(line.debit) > 0
                                                ? money(Number(line.debit))
                                                : '—'}
                                        </td>
                                        <td className="px-6 py-3 text-right font-mono">
                                            {Number(line.credit) > 0
                                                ? money(Number(line.credit))
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="border-t-2 font-semibold">
                                <tr>
                                    <td className="px-6 py-3">Totals</td>
                                    <td className="px-6 py-3 text-right">
                                        {money(total)}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        {money(total)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}
function Action({
    route,
    label,
    icon: Icon,
    destructive = false,
}: {
    route: { action: string; method: string };
    label: string;
    icon: typeof Send;
    destructive?: boolean;
}) {
    return (
        <Form action={route.action} method={route.method as 'post'}>
            {({ processing }) => (
                <Button
                    type="submit"
                    variant={destructive ? 'destructive' : 'default'}
                    disabled={processing}
                    onClick={
                        destructive
                            ? (event) => {
                                  if (
                                      !confirm(
                                          'Post a permanent reversing journal?',
                                      )
                                  ) {
                                      event.preventDefault();
                                  }
                              }
                            : undefined
                    }
                >
                    <Icon />
                    {label}
                </Button>
            )}
        </Form>
    );
}
function Info({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </dt>
            <dd className="mt-1 text-sm">{value}</dd>
        </div>
    );
}
function money(value: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(value);
}
function Status({ status }: { status: string }) {
    return (
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#17458f] capitalize">
            {status}
        </span>
    );
}
FinanceShow.layout = {
    breadcrumbs: [
        { title: 'Finance', href: finance.index() },
        { title: 'Journal', href: '#' },
    ],
};
