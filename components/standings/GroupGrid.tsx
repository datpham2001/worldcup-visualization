import { GroupTable } from './GroupTable'
import { BestThirdTable } from './BestThirdTable'
import type { Group } from '@/types/standings'

interface GroupGridProps {
  groups: Group[]
}

export function GroupGrid({ groups }: GroupGridProps) {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {groups.map(group => (
          <GroupTable key={group.id} group={group} />
        ))}
      </div>
      <BestThirdTable groups={groups} />
    </div>
  )
}
