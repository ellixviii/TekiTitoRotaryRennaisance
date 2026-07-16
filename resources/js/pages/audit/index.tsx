import { Head, router } from '@inertiajs/react';
import { Input } from '@/components/ui/input';

type Event = {
    id: number;
    action: string;
    subject_type: string | null;
    subject_id: number | null;
    created_at: string;
    ip_address: string | null;
    actor: { name: string } | null;
};

export default function AuditIndex({
    events,
    search,
}: {
    events: { data: Event[] };
    search: string;
}) {
    return (
        <>
            <Head title="Audit log" />
            <main className="flex flex-1 flex-col gap-5 p-4 md:p-8">
                <div>
                    <h1 className="text-2xl font-semibold">Audit log</h1>
                    <p className="text-sm text-muted-foreground">
                        Append-only record of security, membership, finance, and
                        operational activity.
                    </p>
                </div>
                <Input
                    defaultValue={search}
                    placeholder="Filter action"
                    onKeyDown={(e) =>
                        e.key === 'Enter' &&
                        router.get('/audit', { search: e.currentTarget.value })
                    }
                />
                <div className="overflow-x-auto rounded-xl border">
                    <table className="w-full text-sm">
                        <thead className="bg-muted">
                            <tr>
                                <th className="p-3 text-left">Manila time</th>
                                <th className="p-3 text-left">Actor</th>
                                <th className="p-3 text-left">Action</th>
                                <th className="p-3 text-left">Subject</th>
                                <th className="p-3 text-left">IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.data.map((e) => (
                                <tr key={e.id} className="border-t">
                                    <td className="p-3">
                                        {new Date(e.created_at).toLocaleString(
                                            'en-PH',
                                        )}
                                    </td>
                                    <td className="p-3">
                                        {e.actor?.name || 'System'}
                                    </td>
                                    <td className="p-3 font-medium">
                                        {e.action}
                                    </td>
                                    <td className="p-3">
                                        {e.subject_type?.split('\\').pop()} #
                                        {e.subject_id}
                                    </td>
                                    <td className="p-3">
                                        {e.ip_address || '—'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </>
    );
}
