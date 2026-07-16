import { Form, Head } from '@inertiajs/react';
import { Plus, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Meeting = {
    id: number;
    title: string;
    starts_at: string | null;
    description: string | null;
};
type Item = {
    id: number;
    position: number;
    title: string;
    discussion: string | null;
    decision: string | null;
    action_owner_id: number | null;
    due_on: string | null;
};
type Member = { id: number; name: string };

export default function MeetingMinutes({
    meeting,
    items,
    members,
}: {
    meeting: Meeting;
    items: Item[];
    members: Member[];
}) {
    return (
        <>
            <Head title={meeting.title} />
            <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-4 md:p-8 print:p-0">
                <header className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">
                            Agenda and minutes
                        </p>
                        <h1 className="text-2xl font-semibold">
                            {meeting.title}
                        </h1>
                        {meeting.starts_at && (
                            <p>
                                {new Date(meeting.starts_at).toLocaleString(
                                    'en-PH',
                                    { timeZone: 'Asia/Manila' },
                                )}
                            </p>
                        )}
                    </div>
                    <Button
                        variant="outline"
                        className="print:hidden"
                        onClick={() => window.print()}
                    >
                        <Printer /> Print minutes
                    </Button>
                </header>
                {meeting.description && (
                    <p className="rounded-xl border bg-card p-4 whitespace-pre-wrap">
                        {meeting.description}
                    </p>
                )}
                <Form
                    action={`/meetings/${meeting.id}/agenda`}
                    method="post"
                    resetOnSuccess
                    className="flex gap-2 print:hidden"
                >
                    <Input
                        name="title"
                        placeholder="New agenda item"
                        required
                    />
                    <Button>
                        <Plus /> Add
                    </Button>
                </Form>
                <ol className="space-y-4">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className="rounded-xl border bg-card p-5"
                        >
                            <h2 className="font-semibold">
                                {item.position}. {item.title}
                            </h2>
                            <Form
                                action={`/meetings/${meeting.id}/agenda/${item.id}`}
                                method="patch"
                                className="mt-4 grid gap-3 print:block"
                            >
                                {({ processing }) => (
                                    <>
                                        <textarea
                                            name="discussion"
                                            defaultValue={item.discussion || ''}
                                            placeholder="Discussion / minutes"
                                            className="min-h-24 rounded-md border bg-background p-3 print:w-full"
                                        />
                                        <textarea
                                            name="decision"
                                            defaultValue={item.decision || ''}
                                            placeholder="Decision / resolution"
                                            className="min-h-20 rounded-md border bg-background p-3 print:w-full"
                                        />
                                        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
                                            <select
                                                name="action_owner_id"
                                                defaultValue={
                                                    item.action_owner_id || ''
                                                }
                                                className="h-9 rounded-md border bg-background px-3"
                                            >
                                                <option value="">
                                                    No action owner
                                                </option>
                                                {members.map((member) => (
                                                    <option
                                                        key={member.id}
                                                        value={member.id}
                                                    >
                                                        {member.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <Input
                                                name="due_on"
                                                type="date"
                                                defaultValue={item.due_on?.slice(
                                                    0,
                                                    10,
                                                )}
                                            />
                                        </div>
                                        <Button
                                            disabled={processing}
                                            className="print:hidden"
                                        >
                                            Save minutes
                                        </Button>
                                    </>
                                )}
                            </Form>
                        </li>
                    ))}
                </ol>
            </main>
        </>
    );
}
