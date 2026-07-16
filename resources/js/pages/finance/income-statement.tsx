import { Head, router } from '@inertiajs/react';
import { Download } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import finance from '@/routes/finance';

type Row = {
    code: string;
    name: string;
    type: 'revenue' | 'expense';
    amount: number;
};
export default function IncomeStatement({
    rows,
    from,
    to,
}: {
    rows: Row[];
    from: string;
    to: string;
}) {
    const [start, setStart] = useState(from);
    const [end, setEnd] = useState(to);
    const revenue = rows
        .filter((r) => r.type === 'revenue')
        .reduce((s, r) => s + r.amount, 0);
    const expenses = rows
        .filter((r) => r.type === 'expense')
        .reduce((s, r) => s + r.amount, 0);
    function filter(e: FormEvent) {
        e.preventDefault();
        router.get(
            finance.incomeStatement.url(),
            { from: start, to: end },
            { preserveState: true, replace: true },
        );
    }

    return (
        <>
            <Head title="Income statement" />
            <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">Income statement</h1>
                    <p className="text-sm text-muted-foreground">
                        Posted journals only · Philippine peso
                    </p>
                </div>
                <form
                    onSubmit={filter}
                    className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4"
                >
                    <div className="grid gap-2">
                        <Label htmlFor="from">From</Label>
                        <Input
                            id="from"
                            type="date"
                            value={start}
                            onChange={(e) => setStart(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="to">To</Label>
                        <Input
                            id="to"
                            type="date"
                            value={end}
                            onChange={(e) => setEnd(e.target.value)}
                        />
                    </div>
                    <Button type="submit">Apply</Button>
                    <Button variant="outline" asChild>
                        <a
                            href={`/finance/income-statement.pdf?from=${start}&to=${end}`}
                        >
                            <Download /> Download PDF
                        </a>
                    </Button>
                </form>
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                    <Section
                        title="Revenue"
                        rows={rows.filter((r) => r.type === 'revenue')}
                    />
                    <div className="my-6 border-t" />
                    <Section
                        title="Expenses"
                        rows={rows.filter((r) => r.type === 'expense')}
                    />
                    <div className="mt-8 flex justify-between border-t-2 pt-4 text-lg font-semibold">
                        <span>Net income</span>
                        <span
                            className={
                                revenue - expenses < 0
                                    ? 'text-red-600'
                                    : 'text-emerald-700'
                            }
                        >
                            {money(revenue - expenses)}
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
function Section({ title, rows }: { title: string; rows: Row[] }) {
    const total = rows.reduce((s, r) => s + r.amount, 0);

    return (
        <section>
            <h2 className="font-semibold">{title}</h2>
            <div className="mt-3 space-y-2">
                {rows.map((r) => (
                    <div
                        key={r.code}
                        className="flex justify-between gap-4 text-sm"
                    >
                        <span>
                            <span className="mr-2 font-mono text-xs text-muted-foreground">
                                {r.code}
                            </span>
                            {r.name}
                        </span>
                        <span className="font-mono">{money(r.amount)}</span>
                    </div>
                ))}
                {rows.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                        No posted {title.toLowerCase()} in this period.
                    </p>
                )}
            </div>
            <div className="mt-3 flex justify-between border-t pt-3 font-medium">
                <span>Total {title.toLowerCase()}</span>
                <span>{money(total)}</span>
            </div>
        </section>
    );
}
function money(value: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(value);
}
IncomeStatement.layout = {
    breadcrumbs: [
        { title: 'Finance', href: finance.index() },
        { title: 'Income statement', href: finance.incomeStatement() },
    ],
};
