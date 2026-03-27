import SectionDivider from '../components/ui/SectionDivider';

export default function Products() {
    return (
        <section id="products" className="w-full min-h-[60vh] flex flex-col pt-24 pb-12 z-10 relative">
            <SectionDivider title="Products" />
            <div className="flex-1 px-8 md:px-24 pt-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="glass-surface glass-card h-64 rounded-xl flex items-center justify-center pointer-events-auto magnetic will-change-transform" data-cursor-label="VIEW">
                            <span className="text-white/40">Product outline {i}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
