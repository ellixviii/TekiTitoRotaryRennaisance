import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import finance from '@/routes/finance';

type Account = { id: number; code: string; name: string; type: string };
type Bank = { id: number; name: string; account_name: string };
type Member = { id: number; name: string };
export default function FinanceCreate({
    accounts,
    banks,
    members,
}: {
    accounts: Account[];
    banks: Bank[];
    members: Member[];
}) {
    return (
        <>
            <Head title="New financial entry" />
            <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold">
                        New financial entry
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Create a balanced draft revenue, expense, or general
                        journal.
                    </p>
                </div>
                <Form
                    {...finance.store.form()}
                    className="grid gap-5 rounded-2xl border bg-card p-6 sm:grid-cols-2"
                >
                    {({ errors, processing }) => (
                        <>
                            <Field
                                label="Entry date"
                                name="entry_date"
                                type="date"
                                defaultValue={new Date().toLocaleDateString(
                                    'en-CA',
                                    { timeZone: 'Asia/Manila' },
                                )}
                                error={errors.entry_date}
                            />
                            <SelectField
                                label="Entry type"
                                name="type"
                                error={errors.type}
                            >
                                <option value="revenue">Revenue</option>
                                <option value="expense">Expense</option>
                                <option value="general">General journal</option>
                            </SelectField>
                            <Field
                                label="Receipt / control number"
                                name="document_number"
                                error={errors.document_number}
                            />
                            <SelectField
                                label="Bank"
                                name="bank_id"
                                error={errors.bank_id}
                            >
                                <option value="">None</option>
                                {banks.map((bank) => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.name} — {bank.account_name}
                                    </option>
                                ))}
                            </SelectField>
                            <SelectField
                                label="Member"
                                name="member_id"
                                error={errors.member_id}
                            >
                                <option value="">External party / guest</option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </SelectField>
                            <Field
                                label="External party name"
                                name="party_name"
                                error={errors.party_name}
                            />
                            <SelectField
                                label="Debit account"
                                name="debit_account_id"
                                error={errors.debit_account_id}
                            >
                                <option value="">Select account</option>
                                {accounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.code} — {a.name}
                                    </option>
                                ))}
                            </SelectField>
                            <SelectField
                                label="Credit account"
                                name="credit_account_id"
                                error={errors.credit_account_id}
                            >
                                <option value="">Select account</option>
                                {accounts.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.code} — {a.name}
                                    </option>
                                ))}
                            </SelectField>
                            <Field
                                label="Amount (PHP)"
                                name="amount"
                                type="number"
                                step="0.01"
                                min="0.01"
                                error={errors.amount}
                            />
                            <div className="grid gap-2 sm:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    name="description"
                                    required
                                    className="min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm"
                                />
                                <InputError message={errors.description} />
                            </div>
                            <InputError
                                message={errors.lines || errors.journal}
                                className="sm:col-span-2"
                            />
                            <div className="flex justify-end gap-2 sm:col-span-2">
                                <Button variant="outline" asChild>
                                    <Link href={finance.index()}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving…' : 'Create draft'}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}
function Field({
    label,
    name,
    error,
    ...props
}: {
    label: string;
    name: string;
    error?: string;
    [key: string]: unknown;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                name={name}
                required={name === 'entry_date' || name === 'amount'}
                {...props}
            />
            <InputError message={error} />
        </div>
    );
}
function SelectField({
    label,
    name,
    error,
    children,
}: {
    label: string;
    name: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <select
                id={name}
                name={name}
                className="h-9 rounded-md border bg-transparent px-3 text-sm"
            >
                {children}
            </select>
            <InputError message={error} />
        </div>
    );
}
FinanceCreate.layout = {
    breadcrumbs: [
        { title: 'Finance', href: finance.index() },
        { title: 'New entry', href: finance.create() },
    ],
};
