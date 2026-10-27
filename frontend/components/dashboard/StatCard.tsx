
import type { ReactNode } from "react";

interface StatCardProps {
    label: string;
    amount: number;
    icon: ReactNode;
    variant?: "received" | "overdue";
    isLoading?: boolean;
}

const variants = {
    received: {
        container: "bg-[#0B0F19]",
        icon: "bg-emerald-100 text-emerald-600",
    },
    overdue: {
        container: "bg-[#0B0F19]",
        icon: "bg-red-100 text-red-600",
    }
};

export default function StatCard({
    label,
    amount,
    icon,
    variant = "received",
    isLoading = false,
}: StatCardProps) {
    const style = variants[variant];

    return (
        <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3 ${style.container}`}
        >
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${style.icon}`}
            >
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-xs font-medium text-white">
                    {label}
                </p>

                {isLoading ? (
                    <div className="mt-1 h-4 w-14 rounded bg-white/20 animate-pulse" />
                ) : (
                    <p className="whitespace-nowrap text-sm font-bold text-white">
                        {variant === "overdue" ? "" : "$"}
                        {amount.toLocaleString("en-US")}
                    </p>
                )}
            </div>
        </div>
    );
}
