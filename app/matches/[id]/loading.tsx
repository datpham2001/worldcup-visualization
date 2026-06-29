import { PageContainer } from '@/components/shared/PageContainer'

export default function MatchLoading() {
  return (
    <PageContainer>
      <div className="bg-bg-surface border border-border rounded-2xl overflow-hidden animate-pulse">
        <div className="h-12 bg-bg-elevated" />
        <div className="px-6 py-8 flex items-center justify-between gap-4">
          <div className="flex-1 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-bg-elevated" />
            <div className="h-5 w-24 bg-bg-elevated rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 h-20 bg-bg-elevated rounded" />
            <div className="w-6 h-6 bg-bg-elevated rounded" />
            <div className="w-16 h-20 bg-bg-elevated rounded" />
          </div>
          <div className="flex-1 flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-bg-elevated" />
            <div className="h-5 w-24 bg-bg-elevated rounded" />
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
