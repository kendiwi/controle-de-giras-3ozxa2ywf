import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/use-auth'
import { useActiveGroup, Group } from '@/contexts/ActiveGroupContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Search, Plus } from 'lucide-react'

export default function GroupsPage() {
  const { user } = useAuth()
  const { setActiveGroup } = useActiveGroup()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [myGroups, setMyGroups] = useState<any[]>([])

  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')

  useEffect(() => {
    if (user) loadMyGroups()
  }, [user])

  const loadMyGroups = async () => {
    const records = await api.groups.listMy(user.id)
    setMyGroups(records)
  }

  const handleSelectGroup = (group: Group) => {
    setActiveGroup({ id: group.id, name: group.name })
    navigate('/giras')
  }

  const handleCreateGroup = async () => {
    if (!newGroupName) return
    try {
      const g = await api.groups.create({ name: newGroupName, owner: user.id })
      await api.groups.join(user.id, g.id)
      await api.groups.updateMember((await api.groups.getMembers(g.id))[0].id, {
        status: 'approved',
        role: 'admin',
      }) // Quick hack to self-approve
      toast({ title: 'Sucesso', description: 'Grupo criado com sucesso!' })
      setNewGroupName('')
      loadMyGroups()
    } catch (e: any) {
      toast({ title: 'Erro', description: e.message, variant: 'destructive' })
    }
  }

  const handleSearch = async () => {
    if (search.length < 3) return
    setHasSearched(false)
    const res = await api.groups.search(search)
    setSearchResults(res)
    setHasSearched(true)
  }

  const handleJoin = async (groupId: string) => {
    try {
      await api.groups.join(user.id, groupId)
      toast({ title: 'Sucesso', description: 'Solicitação enviada. Aguarde aprovação.' })
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: 'Você já enviou solicitação ou ocorreu um erro.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pt-10">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Seus Terreiros</h1>
        <p className="text-muted-foreground text-sm">Selecione um grupo para continuar</p>
      </div>

      <div className="space-y-4">
        {myGroups.map((rel) => (
          <Card
            key={rel.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleSelectGroup(rel.expand.group)}
          >
            <CardHeader className="p-4">
              <CardTitle className="text-lg">{rel.expand.group.name}</CardTitle>
              <CardDescription>Toque para entrar</CardDescription>
            </CardHeader>
          </Card>
        ))}
        {myGroups.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">
            Você ainda não participa de nenhum grupo.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full flex gap-2">
              <Search className="h-4 w-4" /> Buscar
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle>Buscar Terreiro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome do terreiro..."
                />
                <Button onClick={handleSearch}>Buscar</Button>
              </div>
              <div className="space-y-2">
                {searchResults.length === 0 && hasSearched && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    Nenhum terreiro encontrado
                  </p>
                )}
                {searchResults.map((g) => {
                  const isMember = myGroups.some((mg) => mg.group === g.id)
                  return (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <span className="font-medium truncate">{g.name}</span>
                      {!isMember && (
                        <Button size="sm" onClick={() => handleJoin(g.id)}>
                          Pedir Acesso
                        </Button>
                      )}
                      {isMember && <span className="text-xs text-muted-foreground">Membro</span>}
                    </div>
                  )
                })}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full flex gap-2">
              <Plus className="h-4 w-4" /> Criar Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[90%] max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle>Criar Novo Terreiro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Nome do Terreiro"
              />
              <Button className="w-full" onClick={handleCreateGroup}>
                Criar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
