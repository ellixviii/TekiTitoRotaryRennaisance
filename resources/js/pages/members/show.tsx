import { Head, router, useForm } from '@inertiajs/react';
import {
    Award,
    Bell,
    CalendarCheck,
    Edit3,
    Mail,
    MapPin,
    Phone,
    ReceiptText,
    ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import members from '@/routes/members';

type Profile = {
    membership_number: string | null;
    phone: string | null;
    address: string | null;
    birth_date: string | null;
    joined_at: string | null;
    classification: string | null;
    status: string;
};

type Member = {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    roles: { id: number; name: string }[];
    member_profile: Profile;
};
type Transaction = {
    id: number;
    reference: string;
    entry_date: string;
    type: string;
    description: string;
    status: string;
    lines: { debit: string; credit: string }[];
};
type Outstanding = {
    id: number;
    module: string;
    title: string;
    amount: string | null;
    status: string;
};

const tabs = [
    { id: 'transactions', label: 'Transactions', icon: ReceiptText },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'awards', label: 'Awards', icon: Award },
    { id: 'reminders', label: 'Reminders', icon: Bell },
];

export default function MemberShow({
    member,
    canManage,
    transactions,
    outstanding,
}: {
    member: Member;
    canManage: boolean;
    transactions: Transaction[];
    outstanding: Outstanding[];
}) {
    const [editing, setEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('transactions');
    const initials = useInitials();
    const form = useForm({
        name: member.name,
        email: member.email,
        phone: member.member_profile.phone ?? '',
        address: member.member_profile.address ?? '',
        birth_date: member.member_profile.birth_date?.slice(0, 10) ?? '',
        joined_at: member.member_profile.joined_at?.slice(0, 10) ?? '',
        membership_number: member.member_profile.membership_number ?? '',
        classification: member.member_profile.classification ?? '',
    });

    function save(event: FormEvent) {
        event.preventDefault();
        form.patch(members.update.url(member.id), {
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    }

    function changeStatus(status: string) {
        if (confirm(`Change this member's status to ${status}?`)) {
            router.patch(
                members.status.url(member.id),
                { status },
                { preserveScroll: true },
            );
        }
    }

    return (
        <>
            <Head title={member.name} />
            <div className="grid flex-1 gap-6 p-4 lg:grid-cols-[minmax(250px,320px)_1fr] lg:p-8">
                <aside className="self-start rounded-2xl border bg-card p-6 shadow-sm">
                    <div className="flex size-20 items-center justify-center rounded-2xl bg-[#17458f] text-2xl font-semibold text-white">
                        {initials(member.name)}
                    </div>
                    <div className="mt-5 flex items-start justify-between gap-3">
                        <div>
                            <h1 className="text-xl font-semibold">
                                {member.name}
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                {member.member_profile.classification ||
                                    'Rotary member'}
                            </p>
                        </div>
                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => setEditing(true)}
                            aria-label="Edit profile"
                        >
                            <Edit3 />
                        </Button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <StatusBadge status={member.member_profile.status} />
                        {member.roles.map((role) => (
                            <span
                                key={role.id}
                                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-[#17458f]"
                            >
                                {role.name}
                            </span>
                        ))}
                    </div>
                    <dl className="mt-6 space-y-4 text-sm">
                        <Info icon={Mail} label="Email" value={member.email} />
                        <Info
                            icon={Phone}
                            label="Phone"
                            value={member.member_profile.phone}
                        />
                        <Info
                            icon={MapPin}
                            label="Address"
                            value={member.member_profile.address}
                        />
                        <Info
                            icon={ShieldCheck}
                            label="Membership number"
                            value={member.member_profile.membership_number}
                        />
                    </dl>
                    {canManage && (
                        <div className="mt-6 border-t pt-5">
                            <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                Account status
                            </p>
                            <Select
                                value={member.member_profile.status}
                                onValueChange={changeStatus}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="suspended">
                                        Suspended
                                    </SelectItem>
                                    <SelectItem value="archived">
                                        Archived
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </aside>

                <section className="min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm">
                    <div className="overflow-x-auto border-b">
                        <div className="flex min-w-max px-2">
                            {tabs.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium ${activeTab === id ? 'border-[#17458f] text-[#17458f]' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                                >
                                    <Icon className="size-4" />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="p-6 md:p-8">
                        {activeTab === 'transactions' ? (
                            <Transactions
                                transactions={transactions}
                                outstanding={outstanding}
                            />
                        ) : (
                            <EmptyTab
                                tab={tabs.find((tab) => tab.id === activeTab)!}
                            />
                        )}
                    </div>
                </section>
            </div>

            <Dialog open={editing} onOpenChange={setEditing}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit member profile</DialogTitle>
                        <DialogDescription>
                            Changes to member data are recorded in the audit
                            log.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
                        <Field
                            label="Full name"
                            name="name"
                            value={form.data.name}
                            onChange={(value) => form.setData('name', value)}
                            error={form.errors.name}
                            required
                        />
                        <Field
                            label="Email address"
                            name="email"
                            type="email"
                            value={form.data.email}
                            onChange={(value) => form.setData('email', value)}
                            error={form.errors.email}
                            required
                        />
                        <Field
                            label="Phone"
                            name="phone"
                            value={form.data.phone}
                            onChange={(value) => form.setData('phone', value)}
                            error={form.errors.phone}
                        />
                        <Field
                            label="Birth date"
                            name="birth_date"
                            type="date"
                            value={form.data.birth_date}
                            onChange={(value) =>
                                form.setData('birth_date', value)
                            }
                            error={form.errors.birth_date}
                        />
                        {canManage && (
                            <Field
                                label="Membership number"
                                name="membership_number"
                                value={form.data.membership_number}
                                onChange={(value) =>
                                    form.setData('membership_number', value)
                                }
                                error={form.errors.membership_number}
                            />
                        )}
                        {canManage && (
                            <Field
                                label="Joined date"
                                name="joined_at"
                                type="date"
                                value={form.data.joined_at}
                                onChange={(value) =>
                                    form.setData('joined_at', value)
                                }
                                error={form.errors.joined_at}
                            />
                        )}
                        {canManage && (
                            <Field
                                label="Classification"
                                name="classification"
                                value={form.data.classification}
                                onChange={(value) =>
                                    form.setData('classification', value)
                                }
                                error={form.errors.classification}
                            />
                        )}
                        <div className="grid gap-2 sm:col-span-2">
                            <Label htmlFor="address">Address</Label>
                            <textarea
                                id="address"
                                value={form.data.address}
                                onChange={(event) =>
                                    form.setData('address', event.target.value)
                                }
                                className="min-h-24 rounded-md border bg-transparent px-3 py-2 text-sm"
                            />
                            <InputError message={form.errors.address} />
                        </div>
                        <div className="flex justify-end gap-2 sm:col-span-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditing(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving…' : 'Save changes'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

function Field({
    label,
    name,
    value,
    onChange,
    error,
    type = 'text',
    required = false,
}: {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
    error?: string;
    type?: string;
    required?: boolean;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                required={required}
            />
            <InputError message={error} />
        </div>
    );
}

function Info({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof Mail;
    label: string;
    value: string | null;
}) {
    return (
        <div className="flex gap-3">
            <Icon className="mt-0.5 size-4 shrink-0 text-[#17458f]" />
            <div>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 break-words">
                    {value || 'Not provided'}
                </dd>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors =
        status === 'active'
            ? 'bg-emerald-100 text-emerald-700'
            : status === 'suspended'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-slate-100 text-slate-600';

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${colors}`}
        >
            {status}
        </span>
    );
}

function Transactions({
    transactions,
    outstanding,
}: {
    transactions: Transaction[];
    outstanding: Outstanding[];
}) {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-3 font-semibold">Outstanding obligations</h3>
                {outstanding.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No outstanding payables or receivables.
                    </p>
                ) : (
                    <div className="grid gap-2">
                        {outstanding.map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between rounded border p-3"
                            >
                                <span>
                                    {item.title}{' '}
                                    <small className="capitalize">
                                        ({item.module})
                                    </small>
                                </span>
                                <strong>
                                    ₱
                                    {Number(item.amount || 0).toLocaleString(
                                        'en-PH',
                                        { minimumFractionDigits: 2 },
                                    )}
                                </strong>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div>
                <h3 className="mb-3 font-semibold">Posted payment history</h3>
                {transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No posted member transactions.
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left">Date</th>
                                    <th className="p-2 text-left">Reference</th>
                                    <th className="p-2 text-left">
                                        Description
                                    </th>
                                    <th className="p-2 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((t) => (
                                    <tr key={t.id} className="border-t">
                                        <td className="p-2">
                                            {t.entry_date.slice(0, 10)}
                                        </td>
                                        <td className="p-2">{t.reference}</td>
                                        <td className="p-2">{t.description}</td>
                                        <td className="p-2 text-right">
                                            ₱
                                            {t.lines
                                                .reduce(
                                                    (sum, l) =>
                                                        sum + Number(l.debit),
                                                    0,
                                                )
                                                .toLocaleString('en-PH', {
                                                    minimumFractionDigits: 2,
                                                })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function EmptyTab({ tab }: { tab: (typeof tabs)[number] }) {
    const Icon = tab.icon;

    return (
        <div className="flex min-h-72 flex-col items-center justify-center text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-[#17458f]/10 text-[#17458f]">
                <Icon />
            </span>
            <h2 className="mt-4 font-semibold">
                No {tab.label.toLowerCase()} yet
            </h2>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                This tab is ready to receive records from its corresponding
                module in the next build phases.
            </p>
        </div>
    );
}

MemberShow.layout = {
    breadcrumbs: [
        { title: 'Members', href: members.index() },
        { title: 'Profile', href: '#' },
    ],
};
