import { getDb } from "@/lib/db";
import { SmoothScroll } from "@/components/home/SmoothScroll";
import { Hero } from "@/components/home/Hero";
import { AboutPanel, Needs, ProductShelf, EventsCta, Footer } from "@/components/home/Sections";
import { Journey } from "@/components/home/Journey";
import { Timeline } from "@/components/home/Timeline";

export const revalidate = 3600;

export default async function Home() {
  const products = await getDb().listProducts();

  return (
    <main className="w-full flex-1 overflow-x-clip bg-white">
      <SmoothScroll />
      <Hero />
      <Timeline about={<AboutPanel products={products} />} />
      <Needs products={products} />
      <ProductShelf products={products} />
      <Journey products={products.map((p) => ({ code: p.code, name: p.name }))} />
      <EventsCta />
      <Footer />
    </main>
  );
}
