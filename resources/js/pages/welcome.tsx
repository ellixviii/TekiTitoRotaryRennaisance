import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome" />
            <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
                <section className="w-full max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-900/5 sm:p-10 md:p-14">
                    <img
                        src="/brand/signin-logo.png"
                        alt="Rotary Club of Taytay Renaissance — Create Lasting Impact"
                        className="mx-auto block h-auto w-full object-contain"
                    />
                    <h1 className="mt-10 text-3xl font-semibold text-[#17458f]">
                        Organization Management System
                    </h1>
                    <p className="mx-auto mt-3 max-w-xl text-slate-600">
                        A secure home for club membership, finance, projects,
                        attendance, recognition, and meetings.
                    </p>
                    <Link
                        href={auth.user ? dashboard() : login()}
                        className="mt-8 inline-flex rounded-lg bg-[#17458f] px-6 py-3 font-medium text-white transition hover:bg-[#12376f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17458f]"
                    >
                        {auth.user ? 'Open dashboard' : 'Member sign in'}
                    </Link>
                    <div className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-500">
                        <span>Powered by</span>
                        <img
                            src="/brand/powered-by-tekitito.jfif"
                            alt="TekiTito Solutions"
                            className="mx-auto mt-2 h-10 w-36 object-contain"
                        />
                    </div>
                </section>
            </main>
        </>
    );
}
