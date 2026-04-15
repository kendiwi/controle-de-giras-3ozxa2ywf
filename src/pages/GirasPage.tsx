import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { useActiveGroup } from '@/contexts/ActiveGroupContext'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, Calendar as CalIcon, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

export default function GirasPage() {
  const { activeGroup } = useActiveGroup()
  const [giras, setGiras] = useState<any[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (activeGroup) loadGiras()
  }, [activeGroup])

  const loadGiras = async () => {
    const data = await api.giras.list(activeGroup!.id)
    setGiras(data)
  }

  const getStatusColor = (status: string) => {
    if (status === 'ongoing') return 'bg-warning text-warning-foreground'
    if (status === 'finalized') return 'bg-success text-success-foreground'
    return 'bg-secondary text-secondary-foreground'
  }
  const getStatusText = (status: string) => {
    if (status === 'ongoing') return 'Em Andamento'
    if (status === 'finalized') return 'Finalizada'
    return 'Planejada'
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Calendário de Giras</h2>
          <p className="text-sm text-muted-foreground">Gerencie seus eventos</p>
        </div>
      </div>

      <div className="space-y-3">
        {giras.map((g) => (
          <Card
            key={g.id}
            className="cursor-pointer hover:border-primary transition-colors overflow-hidden"
            onClick={() => navigate(`/giras/${g.id}`)}
          >
            <div className="flex">
              <div className="w-16 bg-primary/5 flex flex-col items-center justify-center border-r border-border p-2">
                <CalIcon className="h-5 w-5 text-primary mb-1" />
                <span className="text-xs font-bold text-primary">
                  {format(new Date(g.date), 'dd/MM')}
                </span>
              </div>
              <div className="flex-1 p-4 flex items-center justify-between">
                <div>
                  <CardTitle className="text-base leading-tight mb-1">{g.name}</CardTitle>
                  <span
                    className={cn(
                      'text-[10px] uppercase font-bold px-2 py-0.5 rounded-full',
                      getStatusColor(g.status),
                    )}
                  >
                    {getStatusText(g.status)}
                  </span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </Card>
        ))}
        {giras.length === 0 && (
          <p className="text-center text-muted-foreground py-10">Nenhuma Gira agendada.</p>
        )}
      </div>

      <Button
        className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-elevation z-50"
        onClick={() => navigate('/giras/new')}
      >
        <Plus className="h-6 w-6" />
      </Button>
    </div>
  )
}
