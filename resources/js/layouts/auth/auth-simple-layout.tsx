import { Link } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 p-6 md:p-10">
            <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            href={home()}
                            className="flex w-full flex-col items-center gap-2 font-medium"
                        >
                            <img
                                src="/brand/signin-logo.png"
                                alt="Rotary Club of Taytay Renaissance — Create Lasting Impact"
                                className="block h-auto w-full object-contain"
                            />
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>
                    {children}
                    <div className="border-t border-slate-100 pt-5 text-center text-xs text-slate-500">
                        <span>Powered by</span>
                        <img
                            src="/brand/powered-by-tekitito.jfif"
                            alt="TekiTito Solutions"
                            className="mx-auto mt-2 h-10 w-36 object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
