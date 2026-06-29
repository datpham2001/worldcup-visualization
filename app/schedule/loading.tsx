import { PageContainer } from '@/components/shared/PageContainer'

function SkeletonCard() {
  return (
    <div className="bg-bg-surface border border-border rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-5 w-16 bg-bg-elevated rounded-full" />
        <div className="h-4 w-20 bg-bg-elevated rounded" />
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-bg-elevated" />
          <div className="h-4 w-20 bg-bg-elevated rounded" />
        </div>
        <div className="h-6 w-12 bg-bg-elevated rounded" />
        <div className="flex-1 flex items-center justify-end gap-2">
          <div className="h-4 w-20 bg-bg-elevated rounded" />
          <div className="w-8 h-8 rounded-full bg-bg-elevated" />
        </div>
      </div>
      <div className="mt-3 h-3 w-32 bg-bg-elevated rounded" />
    </div>
  )
}

export default function ScheduleLoading() {
  return (
    <PageContainer>
      <div className="h-8 w-48 bg-bg-elevated rounded mb-6 animate-pulse" />
      <div className="space-y-8">
        {[1, 2].map(g => (
          <div key={g}>
            <div className="h-5 w-32 bg-bg-elevated rounded mb-3 animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {[1,2,3].map(i => <SkeletonCard key={i} />)}
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  )
}
