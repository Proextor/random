import SectionDivider from '../components/ui/SectionDivider';

export default function Studio() {
    return (
        <section id="studio" className="w-full min-h-[60vh] flex flex-col py-12 z-10 relative">
            <SectionDivider title="Studio" />
            <div className="flex-1 px-8 md:px-24 pt-16">
                <div className="matte-surface h-96 rounded-3xl w-full border-[rgba(255,255,255,0.05)] flex items-center justify-center p-8 pointer-events-auto" data-cursor-label="ENTER">
                    <p className="text-white/60 font-light text-xl max-w-2xl text-center leading-relaxed">
                        A limitless digital sandbox powered by real-time hardware accelerated WebGL and organic interface dynamics.
                    </p>
                </div>
            </div>
        </section>
    );
}
