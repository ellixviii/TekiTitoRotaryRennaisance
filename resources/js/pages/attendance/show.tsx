import { Form, Head, Link } from '@inertiajs/react';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
type Member = { id: number; name: string };
type Entry = {
    id: number;
    guest_name: string | null;
    time_in: string;
    time_out: string | null;
    member: { name: string } | null;
};
export default function AttendanceShow({
    event,
    entries,
    members,
}: {
    event: { id: number; title: string };
    entries: Entry[];
    members: Member[];
}) {
    return (
        <>
            <Head title={event.title} />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <header className="flex justify-between">
                    <div>
                        <Link
                            href="/attendance"
                            className="text-sm text-muted-foreground"
                        >
                            ← Attendance
                        </Link>
                        <h1 className="text-2xl font-semibold">
                            {event.title}
                        </h1>
                    </div>
                    <div className="flex gap-2 print:hidden">
                        <Button variant="outline" asChild>
                            <a href={`/attendance/${event.id}/export`}>
                                <Download />
                                CSV
                            </a>
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.print()}
                        >
                            <Printer />
                            Nameplates
                        </Button>
                    </div>
                </header>
                <Form
                    action={`/attendance/${event.id}/tap`}
                    method="post"
                    resetOnSuccess
                    className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4 print:hidden"
                >
                    {({ processing }) => (
                        <>
                            <select
                                name="member_id"
                                className="h-9 rounded-md border bg-background px-3"
                            >
                                <option value="">Select member</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                            <Input name="guest_name" placeholder="Guest name" />
                            <Input
                                name="card_id"
                                placeholder="Tap RFID/NFC here"
                                autoFocus
                            />
                            <Button disabled={processing}>Record tap</Button>
                        </>
                    )}
                </Form>
                <div className="grid gap-3 md:grid-cols-3">
                    {entries.map((e) => (
                        <article
                            key={e.id}
                            className="rounded-xl border bg-card p-4 print:border-2 print:text-center"
                        >
                            <h2 className="text-lg font-semibold">
                                {e.member?.name || e.guest_name}
                            </h2>
                            <p className="text-sm">
                                In:{' '}
                                {new Date(e.time_in).toLocaleString('en-PH')}
                            </p>
                            <p className="text-sm">
                                Out:{' '}
                                {e.time_out
                                    ? new Date(e.time_out).toLocaleString(
                                          'en-PH',
                                      )
                                    : '—'}
                            </p>
                        </article>
                    ))}
                </div>
            </main>
        </>
    );
}
