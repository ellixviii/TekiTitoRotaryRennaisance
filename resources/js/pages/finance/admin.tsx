import { Form, Head, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Bank = { id: number; name: string; account_name: string };
type Account = { id: number; code: string; name: string; type: string };
type Period = {
    id: number;
    name: string;
    starts_on: string;
    ends_on: string;
    closed: boolean;
};

export default function FinanceAdmin({
    banks,
    accounts,
    periods,
}: {
    banks: Bank[];
    accounts: Account[];
    periods: Period[];
}) {
    return (
        <>
            <Head title="Finance administration" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <header>
                    <h1 className="text-2xl font-semibold">
                        Finance administration
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manage the chart of accounts, banks, and posting
                        periods.
                    </p>
                </header>
                <section className="grid gap-4 xl:grid-cols-3">
                    <AdminForm
                        action="/finance/administration/banks"
                        title="Add bank"
                    >
                        <Input name="name" placeholder="Bank name" required />
                        <Input
                            name="account_name"
                            placeholder="Account name"
                            required
                        />
                        <Input
                            name="account_number"
                            placeholder="Account number (encrypted)"
                        />
                    </AdminForm>
                    <AdminForm
                        action="/finance/administration/accounts"
                        title="Add GL account"
                    >
                        <Input name="code" placeholder="Code" required />
                        <Input
                            name="name"
                            placeholder="Account name"
                            required
                        />
                        <select
                            name="type"
                            className="h-9 rounded-md border bg-background px-3"
                        >
                            {[
                                'asset',
                                'liability',
                                'equity',
                                'revenue',
                                'expense',
                            ].map((type) => (
                                <option key={type}>{type}</option>
                            ))}
                        </select>
                    </AdminForm>
                    <AdminForm
                        action="/finance/administration/periods"
                        title="Add accounting period"
                    >
                        <Input
                            name="name"
                            placeholder="Fiscal period"
                            required
                        />
                        <Input name="starts_on" type="date" required />
                        <Input name="ends_on" type="date" required />
                    </AdminForm>
                </section>
                <section className="grid gap-4 lg:grid-cols-3">
                    <List
                        title="Banks"
                        rows={banks.map(
                            (bank) => `${bank.name} — ${bank.account_name}`,
                        )}
                    />
                    <List
                        title="Chart of accounts"
                        rows={accounts.map(
                            (account) =>
                                `${account.code} — ${account.name} (${account.type})`,
                        )}
                    />
                    <div className="rounded-xl border bg-card p-4">
                        <h2 className="font-semibold">Accounting periods</h2>
                        <div className="mt-3 divide-y">
                            {periods.map((period) => (
                                <div
                                    key={period.id}
                                    className="flex items-center justify-between gap-3 py-3 text-sm"
                                >
                                    <span>
                                        {period.name}
                                        <small className="block text-muted-foreground">
                                            {period.starts_on.slice(0, 10)} –{' '}
                                            {period.ends_on.slice(0, 10)}
                                        </small>
                                    </span>
                                    <Button
                                        size="sm"
                                        variant={
                                            period.closed
                                                ? 'outline'
                                                : 'destructive'
                                        }
                                        onClick={() =>
                                            router.patch(
                                                `/finance/administration/periods/${period.id}`,
                                            )
                                        }
                                    >
                                        {period.closed ? 'Reopen' : 'Close'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}

function AdminForm({
    action,
    title,
    children,
}: {
    action: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <Form
            action={action}
            method="post"
            resetOnSuccess
            className="grid gap-3 rounded-xl border bg-card p-4"
        >
            {({ processing, errors }) => (
                <>
                    <h2 className="font-semibold">{title}</h2>
                    {children}
                    {Object.values(errors).map((error) => (
                        <small key={error} className="text-destructive">
                            {error}
                        </small>
                    ))}
                    <Button disabled={processing}>Save</Button>
                </>
            )}
        </Form>
    );
}
function List({ title, rows }: { title: string; rows: string[] }) {
    return (
        <div className="rounded-xl border bg-card p-4">
            <h2 className="font-semibold">{title}</h2>
            <ul className="mt-3 divide-y text-sm">
                {rows.map((row) => (
                    <li key={row} className="py-2">
                        {row}
                    </li>
                ))}
                {rows.length === 0 && (
                    <li className="py-3 text-muted-foreground">
                        No records yet.
                    </li>
                )}
            </ul>
        </div>
    );
}
