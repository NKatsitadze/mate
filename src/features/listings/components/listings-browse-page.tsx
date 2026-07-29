import { ListingsFilterBar } from '@/features/listings/components/listings-filter-bar';
import { ListingsResultsSection } from '@/features/listings/components/listings-results-section';
import { Footer } from '@/shared/components/layout/footer';
import { Header } from '@/shared/components/layout/header';
import { HOME_STATS } from '@/shared/const/home.const';

export const ListingsBrowsePage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        <section className="mx-auto w-full max-w-6xl px-6 pb-10 pt-16 sm:px-10 sm:pt-24">
          <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1">
            <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Hyper-local deals
            </span>
          </div>

          <h1 className="animate-rise animate-rise-1 mt-6 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Discounted finds from <span className="text-primary">shops near you.</span>
          </h1>

          <p className="animate-rise animate-rise-2 mt-4 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Browse surplus goods, deals, and short-term rentals from small Tbilisi
            businesses — no account needed.
          </p>

          <dl className="animate-rise animate-rise-3 mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-3">
            {HOME_STATS.map(({ value, label }) => (
              <div key={label} className="bg-background px-5 py-4">
                <dt className="font-heading text-xl font-bold tracking-tight">{value}</dt>
                <dd className="mt-0.5 text-sm text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label="Browse listings" className="mx-auto w-full max-w-6xl px-6 pb-24 sm:px-10">
          <ListingsFilterBar />
          <div className="mt-6">
            <ListingsResultsSection />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
