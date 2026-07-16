import { Form, Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
type Event = {
    id: number;
    title: string;
    starts_at: string;
    description: string | null;
    attendance_entries_count: number;
};
export default function AttendanceIndex({ events }: { events: Event[] }) {
    return (
        <>
            <Head title="Attendance" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">
                        Attendance tracker
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Manual, guest, RFID, or NFC keyboard-wedge check-in.
                    </p>
                </div>
                <Form
                    action="/attendance"
                    method="post"
                    className="grid gap-3 rounded-xl border bg-card p-4 md:grid-cols-4"
                >
                    {({ processing }) => (
                        <>
                            <Input
                                name="title"
                                placeholder="Event or occasion"
                                required
                            />
                            <Input
                                name="starts_at"
                                type="datetime-local"
                                required
                            />
                            <Input
                                name="description"
                                placeholder="Description"
                            />
                            <Button disabled={processing}>
                                <Plus />
                                Create event
                            </Button>
                        </>
                    )}
                </Form>
                <div className="grid gap-3 md:grid-cols-2">
                    {events.map((e) => (
                        <Link
                            href={`/attendance/${e.id}`}
                            key={e.id}
                            className="rounded-xl border bg-card p-5 hover:border-[#17458f]"
                        >
                            <h2 className="font-semibold">{e.title}</h2>
                            <p className="text-sm text-muted-foreground">
                                {new Date(e.starts_at).toLocaleString('en-PH')}{' '}
                                · {e.attendance_entries_count} entries
                            </p>
                        </Link>
                    ))}
                </div>
            </main>
        </>
    );
}
