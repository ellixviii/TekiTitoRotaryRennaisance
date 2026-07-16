import { Form, Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Category = { id: number; name: string };
type Person = { id: number; name: string };
type Event = { id: number; title: string };
type Award = {
    id: number;
    award_name: string;
    awarded_on: string;
    recipient_name: string | null;
    citation: string | null;
    category: Category;
    recipient: Person | null;
    event: Event | null;
};

export default function Awards({
    categories,
    entries,
    members,
    events,
}: {
    categories: Category[];
    entries: Award[];
    members: Person[];
    events: Event[];
}) {
    return (
        <>
            <Head title="Awards and recognition" />
            <main className="flex flex-1 flex-col gap-6 p-4 md:p-8">
                <header>
                    <h1 className="text-2xl font-semibold">
                        Awards and recognition
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Structured categories, recipients, events, and
                        citations.
                    </p>
                </header>
                <div className="grid gap-4 lg:grid-cols-3">
                    <Form
                        action="/awards/categories"
                        method="post"
                        resetOnSuccess
                        className="grid content-start gap-3 rounded-xl border bg-card p-4"
                    >
                        <h2 className="font-semibold">New category</h2>
                        <Input
                            name="name"
                            placeholder="Category name"
                            required
                        />
                        <textarea
                            name="description"
                            placeholder="Description"
                            className="min-h-20 rounded-md border bg-background p-2"
                        />
                        <Button>Save category</Button>
                    </Form>
                    <Form
                        action="/awards"
                        method="post"
                        resetOnSuccess
                        className="grid gap-3 rounded-xl border bg-card p-4 lg:col-span-2"
                    >
                        <h2 className="font-semibold">Record recognition</h2>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                                name="award_name"
                                placeholder="Award name"
                                required
                            />
                            <Input name="awarded_on" type="date" required />
                            <select
                                name="category_id"
                                required
                                className="h-9 rounded-md border bg-background px-3"
                            >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                    >
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                name="recipient_id"
                                className="h-9 rounded-md border bg-background px-3"
                            >
                                <option value="">
                                    Guest / external recipient
                                </option>
                                {members.map((member) => (
                                    <option key={member.id} value={member.id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                            <Input
                                name="recipient_name"
                                placeholder="External recipient name"
                            />
                            <select
                                name="event_id"
                                className="h-9 rounded-md border bg-background px-3"
                            >
                                <option value="">No linked event</option>
                                {events.map((event) => (
                                    <option key={event.id} value={event.id}>
                                        {event.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <textarea
                            name="citation"
                            placeholder="Citation"
                            className="min-h-20 rounded-md border bg-background p-2"
                        />
                        <Button>Record award</Button>
                    </Form>
                </div>
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {entries.map((entry) => (
                        <article
                            key={entry.id}
                            className="rounded-xl border bg-card p-4"
                        >
                            <p className="text-xs font-medium text-[#17458f] uppercase">
                                {entry.category.name}
                            </p>
                            <h2 className="mt-1 font-semibold">
                                {entry.award_name}
                            </h2>
                            <p className="text-sm">
                                {entry.recipient?.name || entry.recipient_name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {entry.awarded_on.slice(0, 10)}
                                {entry.event && ` · ${entry.event.title}`}
                            </p>
                            {entry.citation && (
                                <p className="mt-3 text-sm">{entry.citation}</p>
                            )}
                        </article>
                    ))}
                </section>
            </main>
        </>
    );
}
