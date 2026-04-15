import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { useActiveGroup } from '@/contexts/ActiveGroupContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Plus, ListIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ListsPage() {
  const { activeGroup } = useActiveGroup()
  const [lists, setLists] = useState<any[]>([])
  const [name, setName] = useState('')
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (activeGroup) loadLists()
  }, [activeGroup])

  const loadLists = async () => {
    const data = await api.lists.list(activeGroup!.id)
    setLists(data)
  }

  const handleCreate = async () => {
    if (!name) return
    await api.lists.create({ name, group: activeGroup!.id })
    setOpen(false)
    setName('')
    loadLists()
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Suas Listas</h2>
          <p className="text-sm text-muted-foreground">Grupos pré-definidos para Giras</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full shadow-subtle">
              <Plus className="h-5 w-5" />
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] rounded-xl">
            <DialogHeader>
              <DialogTitle>Nova Lista</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Nome (Ex: Cambonos)"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Button className="w-full" onClick={handleCreate}>
                Criar Lista
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {lists.map((l) => (
          <Card
            key={l.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate(`/lists/${l.id}`)}
          >
            <CardHeader className="p-4 flex flex-row items-center gap-4 space-y-0">
              <div className="bg-primary/10 p-2 rounded-full">
                <ListIcon className="text-primary h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">{l.name}</CardTitle>
                <CardDescription className="text-xs">Gerenciar membros</CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
        {lists.length === 0 && (
          <p className="text-center text-muted-foreground py-10">Nenhuma lista criada.</p>
        )}
      </div>
    </div>
  )
}
