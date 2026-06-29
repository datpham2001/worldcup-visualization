import { PageContainer } from '@/components/shared/PageContainer'

function SkeletonGroup() {
  return (
    <div className="bg-bg-surface border border-border rounded-xl overflow-hidden animate-pulse">
      <div className="h-9 bg-bg-elevated" />
      <div className="h-8 bg-bg-elevated/50 border-b border-border-subtle" />
      {[1,2,3,4].map(i => (
        <div key={i} className="flex items-center gap-2 px-3 py-2.5 border-b border-border-subtle last:border-0">
          <div className="w-6 h-6 rounded-full bg-bg-elevated" />
          <div className="flex-1 h-4 bg-bg-elevated rounded" />
          {[1,2,3,4,5,6,7].map(j => (
            <div key={j} className="w-6 h-4 bg-bg-elevated rounded" />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function StandingsLoading() {
  return (
    <PageContainer>
      <div className="h-8 w-48 bg-bg-elevated rounded mb-6 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => <SkeletonGroup key={i} />)}
      </div>
    </PageContainer>
  )
}
