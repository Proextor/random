import SectionDivider from '../components/ui/SectionDivider';

export default function Showcase() {
    return (
        <section id="showcase" className="w-full min-h-[60vh] flex flex-col py-12 z-10 relative">
            <SectionDivider title="Showcase" />
            <div className="flex-1 px-8 md:px-24 pt-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[1, 2].map(i => (
                        <div key={i} className="glass-surface glass-card h-[400px] rounded-xl flex items-center justify-center pointer-events-auto magnetic will-change-transform" data-cursor-label="OPEN">
                            <span className="text-white/40">Case Study {i}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
