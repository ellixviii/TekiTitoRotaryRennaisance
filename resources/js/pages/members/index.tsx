import { Form, Head, Link, router } from '@inertiajs/react';
import { Download, Search, Send, UserRound } from 'lucide-react';
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
    DialogTrigger,
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
import invitations from '@/routes/invitations';
import members from '@/routes/members';

type Member = {
    id: number;
    name: string;
    email: string;
    roles: { id: number; name: string }[];
    member_profile: { membership_number: string | null; status: string } | null;
};

type PageLink = { url: string | null; label: string; active: boolean };

type Props = {
    members: {
        data: Member[];
        links: PageLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: { search: string };
    roles: string[];
};

export default function MemberIndex({
    members: paginated,
    filters,
    roles,
}: Props) {
    const [search, setSearch] = useState(filters.search);

    function submitSearch(event: FormEvent) {
        event.preventDefault();
        router.get(members.index.url(), search ? { search } : {}, {
            preserveState: true,
            replace: true,
        });
    }

    return (
        <>
            <Head title="Members" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Members</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage club identities, access, and membership
                            records.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <a href={members.export.url()}>
                                <Download /> Export CSV
                            </a>
                        </Button>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button>
                                    <Send /> Invite member
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Invite a member</DialogTitle>
                                    <DialogDescription>
                                        The private link expires after 72 hours
                                        and works once.
                                    </DialogDescription>
                                </DialogHeader>
                                <Form
                                    {...invitations.create.form()}
                                    className="grid gap-4"
                                >
                                    {({ errors, processing }) => (
                                        <>
                                            <div className="grid gap-2">
                                                <Label htmlFor="invite-email">
                                                    Email address
                                                </Label>
                                                <Input
                                                    id="invite-email"
                                                    name="email"
                                                    type="email"
                                                    required
                                                    autoComplete="off"
                                                />
                                                <InputError
                                                    message={errors.email}
                                                />
                                            </div>
                                            <div className="grid gap-2">
                                                <Label htmlFor="invite-role">
                                                    Initial role
                                                </Label>
                                                <Select
                                                    name="role"
                                                    defaultValue="Member"
                                                >
                                                    <SelectTrigger id="invite-role">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {roles.map((role) => (
                                                            <SelectItem
                                                                key={role}
                                                                value={role}
                                                            >
                                                                {role}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={errors.role}
                                                />
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processing}
                                            >
                                                {processing
                                                    ? 'Sending…'
                                                    : 'Send invitation'}
                                            </Button>
                                        </>
                                    )}
                                </Form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <form onSubmit={submitSearch} className="flex max-w-md gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            className="pl-9"
                            placeholder="Search name, email, or membership number"
                        />
                    </div>
                    <Button type="submit" variant="secondary">
                        Search
                    </Button>
                </form>

                <div className="overflow-hidden rounded-xl border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50 text-left text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">
                                        Member
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Membership
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Role
                                    </th>
                                    <th className="px-4 py-3 font-medium">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {paginated.data.map((member) => (
                                    <tr
                                        key={member.id}
                                        className="hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3">
                                            <Link
                                                href={members.show(member.id)}
                                                className="flex items-center gap-3 font-medium hover:text-[#17458f]"
                                            >
                                                <span className="flex size-9 items-center justify-center rounded-full bg-[#17458f]/10 text-[#17458f]">
                                                    <UserRound className="size-4" />
                                                </span>
                                                <span>
                                                    {member.name}
                                                    <span className="block font-normal text-muted-foreground">
                                                        {member.email}
                                                    </span>
                                                </span>
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            {member.member_profile
                                                ?.membership_number || '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {member.roles
                                                .map((role) => role.name)
                                                .join(', ') || 'Unassigned'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge
                                                status={
                                                    member.member_profile
                                                        ?.status || 'active'
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                                {paginated.data.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-4 py-12 text-center text-muted-foreground"
                                        >
                                            No members found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col items-center justify-between gap-3 border-t px-4 py-3 sm:flex-row">
                        <p className="text-xs text-muted-foreground">
                            Showing {paginated.from ?? 0}–{paginated.to ?? 0} of{' '}
                            {paginated.total}
                        </p>
                        <div className="flex flex-wrap gap-1">
                            {paginated.links.map(
                                (link) =>
                                    link.url && (
                                        <Link
                                            key={link.label}
                                            href={link.url}
                                            preserveScroll
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
            </div>
        </>
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

MemberIndex.layout = {
    breadcrumbs: [{ title: 'Members', href: members.index() }],
};
