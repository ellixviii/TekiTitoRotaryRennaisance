import { Form, Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Year = {
    id: number;
    name: string;
    starts_on: string;
    ends_on: string;
    archived: boolean;
};
type Member = {
    id: number;
    name: string;
    service_hours: number | string;
    recent_attendance: number;
    assignments_count: number;
};
type Project = {
    id: number;
    title: string;
    status: string;
    beneficiaries_target: number | null;
    beneficiaries_actual: number | null;
    outcome_unit: string | null;
    outcome_target: string | null;
    outcome_actual: string | null;
    service_hours: number | string;
    cost: number | string;
};
type Assignment = {
    id: number;
    responsibility: string;
    assignment_type: string;
    member: { name: string };
};
type Onboarding = {
    id: number;
    member_id: number;
    item: string;
    completed_at: string | null;
};

export default function Mission({
    years,
    year,
    projects,
    members,
    assignments,
    onboarding,
}: {
    years: Year[];
    year: Year | null;
    projects: Project[];
    members: Member[];
    assignments: Assignment[];
    onboarding: Onboarding[];
}) {
    return (
        <>
            <Head title="Mission & Continuity" />
            <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 print:p-0">
                <header className="flex flex-wrap justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Mission & continuity
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Service impact, Rotary-year handover, member
                            contribution, and onboarding.
                        </p>
                    </div>
                    <div className="flex gap-2 print:hidden">
                        <select
                            value={year?.id || ''}
                            onChange={(e) =>
                                router.get('/mission', { year: e.target.value })
                            }
                            className="h-9 rounded border bg-background px-3"
                        >
                            {years.map((y) => (
                                <option key={y.id} value={y.id}>
                                    {y.name}
                                    {y.archived ? ' (archived)' : ''}
                                </option>
                            ))}
                        </select>
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                        >
                            Print handover
                        </Button>
                    </div>
                </header>

                <Section title="Rotary year">
                    <Form
                        action="/mission/years"
                        method="post"
                        className="grid gap-3 md:grid-cols-4 print:hidden"
                    >
                        {({ processing }) => (
                            <>
                                <Input
                                    name="name"
                                    placeholder="2026–2027"
                                    required
                                />
                                <Input name="starts_on" type="date" required />
                                <Input name="ends_on" type="date" required />
                                <Button disabled={processing}>
                                    Create year
                                </Button>
                            </>
                        )}
                    </Form>
                    {year && (
                        <div className="mt-3 flex items-center justify-between rounded border p-3">
                            <span>
                                {year.name}: {date(year.starts_on)} –{' '}
                                {date(year.ends_on)}
                            </span>
                            <Button
                                className="print:hidden"
                                variant="outline"
                                onClick={() =>
                                    router.patch(
                                        `/mission/years/${year.id}/archive`,
                                    )
                                }
                            >
                                {year.archived ? 'Restore' : 'Archive'}
                            </Button>
                        </div>
                    )}
                </Section>

                <Section title="Service impact">
                    <div className="grid gap-4 lg:grid-cols-2">
                        {projects.map((p) => (
                            <article key={p.id} className="rounded border p-4">
                                <h3 className="font-semibold">{p.title}</h3>
                                <div className="my-3 grid grid-cols-3 gap-2 text-center">
                                    <Metric
                                        label="Hours"
                                        value={Number(p.service_hours).toFixed(
                                            1,
                                        )}
                                    />
                                    <Metric
                                        label="Cost"
                                        value={`₱${Number(p.cost).toLocaleString('en-PH')}`}
                                    />
                                    <Metric
                                        label="Cost/person"
                                        value={
                                            p.beneficiaries_actual
                                                ? `₱${(Number(p.cost) / p.beneficiaries_actual).toFixed(2)}`
                                                : '—'
                                        }
                                    />
                                </div>
                                <Form
                                    action={`/mission/projects/${p.id}`}
                                    method="patch"
                                    className="grid gap-2 sm:grid-cols-3 print:hidden"
                                >
                                    <Input
                                        name="beneficiaries_target"
                                        type="number"
                                        min="0"
                                        defaultValue={
                                            p.beneficiaries_target || ''
                                        }
                                        placeholder="People target"
                                    />
                                    <Input
                                        name="beneficiaries_actual"
                                        type="number"
                                        min="0"
                                        defaultValue={
                                            p.beneficiaries_actual || ''
                                        }
                                        placeholder="People reached"
                                    />
                                    <Input
                                        name="outcome_unit"
                                        defaultValue={p.outcome_unit || ''}
                                        placeholder="Unit (trees, meals…)"
                                    />
                                    <Input
                                        name="outcome_target"
                                        type="number"
                                        min="0"
                                        step=".01"
                                        defaultValue={p.outcome_target || ''}
                                        placeholder="Outcome target"
                                    />
                                    <Input
                                        name="outcome_actual"
                                        type="number"
                                        min="0"
                                        step=".01"
                                        defaultValue={p.outcome_actual || ''}
                                        placeholder="Outcome actual"
                                    />
                                    <input
                                        type="hidden"
                                        name="rotary_year_id"
                                        value={year?.id || ''}
                                    />
                                    <Button>Save impact</Button>
                                </Form>
                            </article>
                        ))}
                    </div>
                </Section>

                <Section title="Log volunteer service">
                    <Form
                        action="/mission/service-hours"
                        method="post"
                        className="grid gap-3 md:grid-cols-5 print:hidden"
                    >
                        <select
                            name="project_id"
                            required
                            className="h-9 rounded border bg-background px-2"
                        >
                            <option value="">Project</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.title}
                                </option>
                            ))}
                        </select>
                        <select
                            name="member_id"
                            required
                            className="h-9 rounded border bg-background px-2"
                        >
                            <option value="">Member</option>
                            {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                        <Input name="served_on" type="date" required />
                        <Input
                            name="hours"
                            type="number"
                            min=".25"
                            max="24"
                            step=".25"
                            placeholder="Hours"
                            required
                        />
                        <Button>Log hours</Button>
                    </Form>
                </Section>

                <Section title="Officers & committees">
                    <Form
                        action="/mission/assignments"
                        method="post"
                        className="grid gap-3 md:grid-cols-4 print:hidden"
                    >
                        <input
                            type="hidden"
                            name="rotary_year_id"
                            value={year?.id || ''}
                        />
                        <select
                            name="member_id"
                            required
                            className="h-9 rounded border bg-background px-2"
                        >
                            <option value="">Member</option>
                            {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                        <select
                            name="assignment_type"
                            className="h-9 rounded border bg-background px-2"
                        >
                            <option value="officer">Officer</option>
                            <option value="committee">Committee</option>
                        </select>
                        <Input
                            name="responsibility"
                            placeholder="President / Service Committee"
                            required
                        />
                        <Button>Assign</Button>
                    </Form>
                    <ul className="mt-3 grid gap-2 md:grid-cols-2">
                        {assignments.map((a) => (
                            <li key={a.id} className="rounded border p-3">
                                <b>{a.member.name}</b> — {a.responsibility}{' '}
                                <small>({a.assignment_type})</small>
                            </li>
                        ))}
                    </ul>
                </Section>

                <Section title="New-member onboarding">
                    <Form
                        action="/mission/onboarding"
                        method="post"
                        className="grid gap-3 md:grid-cols-4 print:hidden"
                    >
                        <select
                            name="member_id"
                            required
                            className="h-9 rounded border bg-background px-2"
                        >
                            <option value="">New member</option>
                            {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                        <select
                            name="mentor_id"
                            className="h-9 rounded border bg-background px-2"
                        >
                            <option value="">Mentor</option>
                            {members.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.name}
                                </option>
                            ))}
                        </select>
                        <Input
                            name="item"
                            placeholder="Attend orientation"
                            required
                        />
                        <Button>Add item</Button>
                    </Form>
                    <div className="mt-3 grid gap-2">
                        {onboarding.map((i) => (
                            <button
                                key={i.id}
                                onClick={() =>
                                    router.patch(`/mission/onboarding/${i.id}`)
                                }
                                className={`rounded border p-3 text-left ${i.completed_at ? 'line-through opacity-60' : ''}`}
                            >
                                {
                                    members.find((m) => m.id === i.member_id)
                                        ?.name
                                }
                                : {i.item}
                            </button>
                        ))}
                    </div>
                </Section>

                <Section title="Engagement indicators (last 90 days)">
                    <p className="mb-3 text-xs text-muted-foreground">
                        Transparent signals only; officers must contact members
                        personally before drawing conclusions.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr>
                                    <th className="p-2 text-left">Member</th>
                                    <th>Service hours</th>
                                    <th>Attendance</th>
                                    <th>Responsibilities</th>
                                    <th>Follow-up</th>
                                </tr>
                            </thead>
                            <tbody>
                                {members.map((m) => (
                                    <tr key={m.id} className="border-t">
                                        <td className="p-2">{m.name}</td>
                                        <td className="text-center">
                                            {Number(m.service_hours).toFixed(1)}
                                        </td>
                                        <td className="text-center">
                                            {m.recent_attendance}
                                        </td>
                                        <td className="text-center">
                                            {m.assignments_count}
                                        </td>
                                        <td className="text-center">
                                            {Number(m.service_hours) === 0 &&
                                            m.recent_attendance === 0
                                                ? 'Check in'
                                                : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Section>
            </main>
        </>
    );
}
function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section className="rounded-xl border bg-card p-5">
            <h2 className="mb-4 text-lg font-semibold">{title}</h2>
            {children}
        </section>
    );
}
function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded bg-muted p-2">
            <strong className="block">{value}</strong>
            <small>{label}</small>
        </div>
    );
}
function date(value: string) {
    return new Date(value).toLocaleDateString('en-PH');
}
