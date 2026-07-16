export default function AppLogo() {
    return (
        <>
            <img
                src="/brand/sidebar-logo.jfif"
                alt="Rotary Club of Taytay Renaissance"
                className="h-10 w-10 rounded-md bg-white object-cover object-left"
            />
            <div className="ml-2 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Rotary Renaissance
                </span>
                <span className="truncate text-xs text-muted-foreground">
                    Organization System
                </span>
            </div>
        </>
    );
}
