import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HumanPortfolio } from "@/components/human-portfolio";
import { getHumanPortfolio, HUMAN_PORTFOLIOS } from "@/lib/portfolio";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const seed = HUMAN_PORTFOLIOS[slug.toLowerCase()];
  if (!seed) return { title: "Human not found" };
  return {
    title: `${seed.name} · human portfolio`,
    description: seed.bio,
  };
}

export default async function HumanPortfolioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const portfolio = await getHumanPortfolio(slug);
  if (!portfolio) notFound();
  return <HumanPortfolio portfolio={portfolio} />;
}
