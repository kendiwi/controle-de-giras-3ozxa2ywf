import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { useRealtime } from '@/hooks/use-realtime'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export default function GiraDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [gira, setGira] = useState<any>(null)
  const [attendances, setAttendances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    if (!id) return
    try {
      setLoading(true)
      const [g, a] = await Promise.all([api.giras.get(id), api.attendance.list(id)])
      setGira(g)
      setAttendances(a)
    } catch (err) {
      console.error(err)
      toast({
        title: 'Gira não encontrada',
        description: 'A gira que você tentou acessar não existe ou ocorreu um erro.',
        variant: 'destructive',
      })
      navigate('/giras', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [id])

  useRealtime('attendance', (e) => {
    if (e.action === 'update' && e.record.gira === id) {
      setAttendances((prev) =>
        prev.map((a) => (a.id === e.record.id ? { ...a, present: e.record.present } : a)),
      )
    }
  })

  useRealtime('giras', (e) => {
    if (e.action === 'update' && e.record.id === id) {
      setGira((prev) => ({ ...prev, ...e.record }))
    }
  })

  const handleStatusChange = async (status: string) => {
    await api.giras.update(id!, { status })
    toast({
      title: 'Status Atualizado',
      description: `Gira agora está: ${status === 'ongoing' ? 'Em andamento' : 'Finalizada'}`,
    })
  }

  const toggleAttendance = async (attId: string, present: boolean) => {
    if (gira?.status === 'finalized') return

    // Optimistic update
    setAttendances((prev) => prev.map((a) => (a.id === attId ? { ...a, present } : a)))

    try {
      await api.attendance.update(attId, present)
    } catch (err) {
      // Revert on error
      setAttendances((prev) => prev.map((a) => (a.id === attId ? { ...a, present: !present } : a)))
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a presença.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-50 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!gira) return null

  const total = attendances.length
  const presentCount = attendances.filter((a) => a.present).length
  const progress = total ? (presentCount / total) * 100 : 0

  const isOngoing = gira.status === 'ongoing'
  const isFinalized = gira.status === 'finalized'

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="sticky top-0 z-20 bg-background border-b shadow-sm">
        <div className="flex items-center gap-3 p-4 pb-2">
          <button onClick={() => navigate(-1)} className="p-2 bg-secondary rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 truncate">
            <h2 className="text-lg font-bold truncate">{gira.name}</h2>
            <p className="text-xs text-muted-foreground">
              {format(new Date(gira.date), 'dd/MM/yyyy')}
            </p>
          </div>
          {isOngoing && (
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-warning"></span>
            </span>
          )}
        </div>

        <div className="px-4 pb-3">
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span>
              Presença: {presentCount} de {total}
            </span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 pb-24">
        {gira.status === 'planned' && (
          <div className="text-center p-6 bg-card rounded-xl border border-border mb-4 shadow-sm">
            <h3 className="font-bold text-lg mb-2">Pronto para começar?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              A lista está pronta. Inicie a gira para começar a marcar presença.
            </p>
            <Button onClick={() => handleStatusChange('ongoing')} className="w-full">
              Iniciar Gira
            </Button>
          </div>
        )}

        {attendances.map((a) => (
          <label
            key={a.id}
            className={cn(
              'flex items-center justify-between p-3 bg-card rounded-xl shadow-sm border cursor-pointer transition-all',
              a.present ? 'border-success bg-success/5' : 'border-border',
            )}
          >
            <div className="flex items-center gap-3">
              <Avatar
                className={cn(
                  'h-10 w-10 transition-all',
                  a.present && 'ring-2 ring-success ring-offset-2',
                )}
              >
                {a.expand?.medium?.photo && (
                  <AvatarImage
                    src={api.getFileUrl(a.expand.medium, a.expand.medium.photo)}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {a.expand?.medium?.name?.[0]}
                </AvatarFallback>
              </Avatar>
              <span className={cn('font-medium', a.present && 'text-success')}>
                {a.expand?.medium?.name}
              </span>
            </div>
            <div className="flex items-center justify-center w-8 h-8">
              <Checkbox
                checked={a.present}
                onCheckedChange={(c) => toggleAttendance(a.id, c === true)}
                disabled={isFinalized}
                className={cn(
                  'h-6 w-6 rounded-full',
                  a.present &&
                    'border-success bg-success data-[state=checked]:bg-success data-[state=checked]:border-success',
                )}
              />
            </div>
          </label>
        ))}
      </div>

      {isOngoing && (
        <div className="fixed bottom-16 w-full p-4 bg-background/80 backdrop-blur border-t z-20">
          <Button
            onClick={() => handleStatusChange('finalized')}
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 flex gap-2"
          >
            <CheckCircle2 className="h-5 w-5" /> Finalizar Gira
          </Button>
        </div>
      )}

      {isFinalized && (
        <div className="fixed bottom-16 w-full p-4 bg-background/80 backdrop-blur border-t z-20">
          <Button
            onClick={() => handleStatusChange('ongoing')}
            variant="outline"
            className="w-full h-12 text-base font-bold flex gap-2"
          >
            Reabrir Gira
          </Button>
        </div>
      )}
    </div>
  )
}
