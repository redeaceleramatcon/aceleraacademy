import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "@/components/icons";
import { Container } from "@/components/ui/Container";

export function ContentRow({
  title,
  href,
  children,
}: {
  title: string;
  href?: string;
  children: ReactNode;
}) {
  return (
    <section className="py-6 sm:py-8">
      <Container>
        <div className="mb-4 flex items-center justify-between sm:mb-5">
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          {href && (
            <Link
              href={href}
              className="group flex items-center gap-1 text-sm font-medium text-muted transition-colors hover:text-brand-orange-light"
            >
              Ver todos
              <ChevronRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
        </div>

        <div className="scrollbar-hide -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:gap-5 sm:px-6 lg:-mx-10 lg:px-10">
          {children}
        </div>
      </Container>
    </section>
  );
}
