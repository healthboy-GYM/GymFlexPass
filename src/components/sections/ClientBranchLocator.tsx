
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const ClientBranchLocator = dynamic(
  () => import(/* webpackChunkName: "branch-locator" */ '@/components/sections/BranchLocator').then((mod) => mod.BranchLocator),
  {
    ssr: false,
    loading: () => (
        <section className="w-full py-12 md:py-24 bg-secondary/30">
            <div className="container px-4 md:px-6 animate-in fade-in-0 slide-in-from-bottom-5 duration-1000 ease-in-out">
                <div className="flex flex-col items-center justify-center space-y-2 text-center mb-8">
                    <Skeleton className="h-10 w-3/4 max-w-md" />
                    <Skeleton className="h-6 w-full max-w-xl" />
                </div>
                <div className="max-w-7xl mx-auto mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="space-y-2">
                       <Skeleton className="h-4 w-20" />
                       <Skeleton className="h-11 w-full" />
                    </div>
                  ))}
                </div>
                <div className="relative w-full max-w-7xl mx-auto h-[400px] md:h-[500px] rounded-lg overflow-hidden bg-secondary mb-6">
                   <Skeleton className="w-full h-full" />
                </div>
                <div className="max-w-7xl mx-auto">
                    <Skeleton className="h-7 w-48 mb-4" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        </section>
    ),
  }
);

export default ClientBranchLocator;
