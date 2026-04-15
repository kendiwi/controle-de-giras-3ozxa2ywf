import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { useActiveGroup } from '@/contexts/ActiveGroupContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Search, Plus, UserCircle, Image as ImageIcon } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'

export default function MediumsPage() {
  const { activeGroup } = useActiveGroup()
  const { toast } = useToast()
  const [mediums, setMediums] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (activeGroup) loadMediums()
  }, [activeGroup])

  const loadMediums = async () => {
    const data = await api.mediums.list(activeGroup!.id)
    setMediums(data)
  }

  const handleSave = async () => {
    if (!name.trim()) return
    const fd = new FormData()
    fd.append('name', name)
    fd.append('group', activeGroup!.id)
    fd.append('active', 'true')
    if (photo) fd.append('photo', photo)

    try {
      if (editingId) await api.mediums.update(editingId, fd)
      else await api.mediums.create(fd)
      toast({ title: 'Sucesso', description: 'Médium salvo.' })
      setOpen(false)
      setName('')
      setPhoto(null)
      setEditingId(null)
      loadMediums()
    } catch (e) {
      toast({ title: 'Erro', description: 'Falha ao salvar', variant: 'destructive' })
    }
  }

  const handleEdit = (m: any) => {
    setEditingId(m.id)
    setName(m.name)
    setPhoto(null)
    setOpen(true)
  }

  const filtered = mediums.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 space-y-4">
      <div className="sticky top-16 bg-background pt-2 pb-4 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-card"
            placeholder="Buscar médium..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((m) => (
          <div
            key={m.id}
            className="flex items-center p-3 bg-card rounded-xl shadow-sm border border-border"
            onClick={() => handleEdit(m)}
          >
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              {m.photo ? (
                <AvatarImage src={api.getFileUrl(m, m.photo)} className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-primary">
                <UserCircle className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 flex-1">
              <p className="font-semibold text-foreground">{m.name}</p>
              <p className="text-xs text-success font-medium">Ativo</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground pt-10">Nenhum médium encontrado.</p>
        )}
      </div>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-elevation z-50"
            onClick={() => {
              setEditingId(null)
              setName('')
              setPhoto(null)
            }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <div className="p-6 space-y-6">
            <DrawerHeader className="p-0">
              <DrawerTitle>{editingId ? 'Editar' : 'Novo'} Médium</DrawerTitle>
            </DrawerHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div className="space-y-2">
                <Label>Foto (Opcional)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="flex-1"
                    onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={!name.trim()}>
                Salvar
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
