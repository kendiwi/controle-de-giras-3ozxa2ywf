import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '@/services/api'
import { useActiveGroup } from '@/contexts/ActiveGroupContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function GiraCreatePage() {
  const { activeGroup } = useActiveGroup()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [listId, setListId] = useState('all')
  const [lists, setLists] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (activeGroup) api.lists.list(activeGroup.id).then(setLists)
  }, [activeGroup])

  const handleSave = async () => {
    if (!name || !date) {
      toast({ title: 'Atenção', description: 'Preencha nome e data.' })
      return
    }
    setLoading(true)
    try {
      const gDate = new Date(date).toISOString()
      await api.giras.create(activeGroup!.id, name, gDate, listId === 'all' ? undefined : listId)
      toast({ title: 'Sucesso', description: 'Gira planejada!' })
      navigate('/giras')
    } catch (e) {
      toast({ title: 'Erro', description: 'Ocorreu um erro ao criar.', variant: 'destructive' })
    }
    setLoading(false)
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate(-1)} className="p-2 bg-secondary rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold">Planejar Gira</h2>
      </div>

      <div className="space-y-4 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="space-y-2">
          <Label>Nome da Gira</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Gira de Caboclos"
          />
        </div>
        <div className="space-y-2">
          <Label>Data</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Lista de Participantes</Label>
          <Select value={listId} onValueChange={setListId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Médiuns Ativos</SelectItem>
              {lists.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full mt-4" onClick={handleSave} disabled={loading}>
          Salvar Evento
        </Button>
      </div>
    </div>
  )
}
