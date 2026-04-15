import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { useActiveGroup } from '@/contexts/ActiveGroupContext'
import { Checkbox } from '@/components/ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowLeft } from 'lucide-react'

export default function ListDetailPage() {
  const { id } = useParams()
  const { activeGroup } = useActiveGroup()
  const navigate = useNavigate()
  const [mediums, setMediums] = useState<any[]>([])
  const [listMediums, setListMediums] = useState<any[]>([])
  const [listInfo, setListInfo] = useState<any>(null)

  useEffect(() => {
    if (activeGroup && id) loadData()
  }, [activeGroup, id])

  const loadData = async () => {
    const [all, lm, l] = await Promise.all([
      api.mediums.list(activeGroup!.id),
      api.lists.getMediums(id!),
      pb.collection('lists').getOne(id!), // quick inline fetch
    ])
    setMediums(all)
    setListMediums(lm)
    setListInfo(l)
  }

  const handleToggle = async (mediumId: string, isChecked: boolean) => {
    if (isChecked) {
      const lm = await api.lists.addMedium(id!, mediumId)
      setListMediums([...listMediums, lm])
    } else {
      const lm = listMediums.find((l) => l.medium === mediumId)
      if (lm) {
        await api.lists.removeMedium(lm.id)
        setListMediums(listMediums.filter((l) => l.id !== lm.id))
      }
    }
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-secondary rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-xl font-bold">{listInfo?.name || 'Carregando...'}</h2>
          <p className="text-sm text-muted-foreground">{listMediums.length} membros selecionados</p>
        </div>
      </div>

      <div className="space-y-2">
        {mediums.map((m) => {
          const isChecked = listMediums.some((lm) => lm.medium === m.id)
          return (
            <label
              key={m.id}
              className="flex items-center justify-between p-3 bg-card rounded-xl shadow-sm border border-border cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {m.photo && (
                    <AvatarImage src={api.getFileUrl(m, m.photo)} className="object-cover" />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {m.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{m.name}</span>
              </div>
              <Checkbox
                checked={isChecked}
                onCheckedChange={(c) => handleToggle(m.id, c === true)}
                className="h-5 w-5 rounded-full"
              />
            </label>
          )
        })}
      </div>
    </div>
  )
}
import pb from '@/lib/pocketbase/client' // for inline fetch
