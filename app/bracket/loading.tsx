import { PageContainer } from '@/components/shared/PageContainer'

export default function BracketLoading() {
  return (
    <PageContainer>
      <div className="h-8 w-56 bg-bg-elevated rounded mb-6 animate-pulse" />
      <div className="bg-bg-surface border border-border rounded-2xl p-8">
        <div className="flex gap-8 items-start overflow-x-auto">
          {[32, 16, 8, 4, 2].map((count, i) => (
            <div key={i} className="flex flex-col gap-3 shrink-0">
              <div className="h-5 w-16 bg-bg-elevated rounded mx-auto animate-pulse" />
              {Array.from({ length: Math.min(count, 8) }).map((_, j) => (
                <div key={j} className="w-44 h-14 bg-bg-elevated rounded-lg animate-pulse" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </PageContainer>
  )
}
