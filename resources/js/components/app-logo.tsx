export default function AppLogo() {
    return (
        <>
            <img
                src="/brand/sidebar-logo.jfif"
                alt="Rotary Club of Taytay Renaissance"
                className="h-auto w-full max-w-48 bg-white object-contain group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:object-cover group-data-[collapsible=icon]:object-[78%_center]"
            />
            <span className="text-xs font-medium tracking-wide text-muted-foreground group-data-[collapsible=icon]:hidden">
                Organization Management System
            </span>
        </>
    );
}
