"use client";

interface StepItem {
    id: string;
    title: string;
    description: string;
    tag: string;
    icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
}

const steps: StepItem[] = [
    {
        id: "01",
        title: "Late payments",
        description: "Most late invoices aren't ignored on purpose. They get forgotten, misplaced, or buried in an overcrowded inbox.",
        tag: "Average 18+ days overdue",
        icon: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
    {
        id: "02",
        title: "Awkward follow-ups",
        description: "Chasing a client feels uncomfortable and friction-heavy, so freelancers procrastinate reminders for weeks.",
        tag: "Uncomfortable conversations",
        icon: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="8" y1="10" x2="8.01" y2="10" strokeWidth="3" />
                <line x1="12" y1="10" x2="12.01" y2="10" strokeWidth="3" />
                <line x1="16" y1="10" x2="16.01" y2="10" strokeWidth="3" />
            </svg>
        ),
    },
    {
        id: "03",
        title: "Surprise cash gaps",
        description: "You only discover the shortfall when bills and rent are already due and the promised funds haven't arrived.",
        tag: "Stressful cash flow drops",
        icon: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
                <path d="M12 2v20" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                <line x1="3" y1="3" x2="21" y2="21" />
            </svg>
        ),
    }
];

export default function Subhero() {
    return (
        <section id="subhero" className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="relative isolate overflow-hidden rounded-3xl  px-6 py-16 sm:py-20 sm:px-12 text-center bg-[#F3F4F6]">
                <div className="relative z-10 max-w-3xl mx-auto">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#1E1B3A] mt-4 leading-tight">
                        Getting paid shouldn't be this hard
                    </h2>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 mt-12 text-left">
                    {steps.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.id}
                                className="group relative bg-white/95 backdrop-blur-sm rounded-3xl p-6 sm:p-7 shadow-sm  border border-white/70 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-[#00a3d9] flex items-center justify-center group-hover:bg-[#00c2ff] group-hover:text-white transition-colors duration-300 shadow-sm">
                                            <Icon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                                        </div>
                                        <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-[#00a3d9] transition-colors">
                                            {item.id}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-[#008dbd] transition-colors">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                                        {item.description}
                                    </p>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-500">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                        {item.tag}
                                    </span>
                                    <span className="text-slate-300 group-hover:text-[#00a3d9] transition-colors">
                                        &rarr;
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}