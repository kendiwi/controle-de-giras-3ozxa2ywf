import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { useAuth } from '@/hooks/use-auth'
import { useActiveGroup, Group } from '@/contexts/ActiveGroupContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, User, LogOut, ArrowLeftRight, ChevronDown } from 'lucide-react'
import { useRealtime } from '@/hooks/use-realtime'
import { getErrorMessage } from '@/lib/pocketbase/errors'

export default function GroupsPage() {
  const { user, signOut } = useAuth()
  const { activeGroup, setActiveGroup } = useActiveGroup()
  const navigate = useNavigate()
  const { toast } = useToast()

  const [activeGroups, setActiveGroups] = useState<any[]>([])
  const [pendingGroups, setPendingGroups] = useState<any[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([])
  const [isOwnerOrAdmin, setIsOwnerOrAdmin] = useState(false)

  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const loadMyGroups = async () => {
    if (!user) return
    try {
      const records = await api.groups.listMy(user.id)
      setActiveGroups(records.filter((r: any) => r.status === 'approved'))
      setPendingGroups(records.filter((r: any) => r.status === 'pending'))

      const info = await api.groups.getPendingApprovalsInfo(user.id)
      setIsOwnerOrAdmin(info.isOwnerOrAdmin)
      setPendingApprovals(info.requests)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (user) loadMyGroups()
  }, [user])

  useRealtime('group_members', () => {
    loadMyGroups()
  })

  const handleSelectGroup = (group: Group) => {
    setActiveGroup({ id: group.id, name: group.name })
    navigate('/giras')
  }

  const handleApproveRequest = async (requestId: string, role: string = 'member') => {
    try {
      await api.groups.updateMember(requestId, { status: 'approved', role })
      toast({
        title: 'Sucesso',
        description: `Solicitação aprovada como ${role === 'admin' ? 'Chefe' : 'Membro'}.`,
      })
      loadMyGroups()
    } catch (e: any) {
      toast({ title: 'Erro', description: getErrorMessage(e), variant: 'destructive' })
    }
  }

  const handleDenyRequest = async (requestId: string) => {
    try {
      await api.groups.updateMember(requestId, { status: 'denied' })
      toast({ title: 'Sucesso', description: 'Solicitação negada.' })
      loadMyGroups()
    } catch (e: any) {
      toast({ title: 'Erro', description: getErrorMessage(e), variant: 'destructive' })
    }
  }

  const handleCreateGroup = async () => {
    if (!newGroupName) return
    try {
      const g = await api.groups.create({ name: newGroupName, owner: user.id })
      await api.groups.join(user.id, g.id)
      const members = await api.groups.getMembers(g.id)
      if (members.length > 0) {
        await api.groups.updateMember(members[0].id, {
          status: 'approved',
          role: 'admin',
        })
      }
      toast({ title: 'Sucesso', description: 'Terreiro criado com sucesso!' })
      setNewGroupName('')
      loadMyGroups()
    } catch (e: any) {
      toast({ title: 'Erro', description: getErrorMessage(e), variant: 'destructive' })
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
      loadMyGroups()
    } catch (e: any) {
      toast({
        title: 'Erro',
        description: getErrorMessage(e) || 'Você já enviou solicitação ou ocorreu um erro.',
        variant: 'destructive',
      })
    }
  }

  const handleCancelRequest = async (requestId: string) => {
    setCancellingId(requestId)
    try {
      await api.groups.deleteMember(requestId)
      toast({ title: 'Sucesso', description: 'Solicitação cancelada com sucesso.' })
      loadMyGroups()
    } catch (e: any) {
      toast({ title: 'Erro', description: getErrorMessage(e), variant: 'destructive' })
    } finally {
      setCancellingId(null)
    }
  }

  const handleLogout = () => {
    signOut()
    navigate('/auth')
  }

  return (
    <div className="p-4 space-y-6 max-w-lg mx-auto pt-6">
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => activeGroup && navigate('/giras')}
          disabled={!activeGroup}
          className="flex gap-2"
        >
          <ArrowLeftRight className="h-4 w-4" />
          Trocar
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full border border-border shadow-sm"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.avatar ? api.getFileUrl(user, user.avatar) : ''}
                  alt={user?.name || user?.email}
                />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name || 'Usuário'}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair da conta</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Seus Terreiros</h1>
        <p className="text-muted-foreground text-sm">Selecione um grupo para continuar</p>
      </div>

      <div className="space-y-6">
        {isOwnerOrAdmin && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2 text-primary">Para Aprovação</h2>
            {pendingApprovals.map((req) => (
              <Card key={req.id} className="border-primary/20 bg-primary/5">
                <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-base">
                      {req.expand?.user?.name || 'Usuário Sem Nome'}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mb-1">
                      {req.expand?.user?.email}
                    </div>
                    <CardDescription>
                      quer entrar em <strong>{req.expand?.group?.name}</strong>
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      onClick={() => handleDenyRequest(req.id)}
                    >
                      Recusar
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Aprovar <ChevronDown className="ml-1 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleApproveRequest(req.id, 'member')}>
                          Como Membro
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleApproveRequest(req.id, 'admin')}>
                          Como Chefe
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </Card>
            ))}
            {pendingApprovals.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">
                Nenhuma solicitação pendente
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Meus Terreiros</h2>
          {activeGroups.map((rel) => {
            const isChief = rel.role === 'admin' || rel.expand?.group?.owner === user?.id
            return (
              <Card
                key={rel.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleSelectGroup(rel.expand.group)}
              >
                <CardHeader className="p-4 flex flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{rel.expand.group.name}</CardTitle>
                    <CardDescription>Toque para entrar</CardDescription>
                  </div>
                  <Badge variant={isChief ? 'default' : 'secondary'}>
                    {isChief ? 'Chefe' : 'Membro'}
                  </Badge>
                </CardHeader>
              </Card>
            )
          })}
          {activeGroups.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Você ainda não participa de nenhum grupo.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Minhas Solicitações</h2>
          {pendingGroups.map((rel) => (
            <Card key={rel.id} className="opacity-90 bg-muted/30">
              <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">
                      {rel.expand?.group?.name || 'Grupo Desconhecido'}
                    </CardTitle>
                    <Badge variant="secondary">Pendente</Badge>
                  </div>
                  <CardDescription>Aguardando aprovação</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={() => handleCancelRequest(rel.id)}
                  disabled={cancellingId === rel.id}
                >
                  {cancellingId === rel.id ? 'Cancelando...' : 'Cancelar Solicitação'}
                </Button>
              </CardHeader>
            </Card>
          ))}
          {pendingGroups.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              Nenhuma solicitação pendente enviada.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-4">
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
                  const isMember = activeGroups.some((mg) => mg.group === g.id)
                  const pendingRel = pendingGroups.find((mg) => mg.group === g.id)
                  const isPending = !!pendingRel
                  return (
                    <div
                      key={g.id}
                      className="flex items-center justify-between p-3 border rounded-lg gap-2"
                    >
                      <span className="font-medium truncate flex-1">{g.name}</span>
                      {!isMember && !isPending && (
                        <Button size="sm" onClick={() => handleJoin(g.id)}>
                          Pedir Acesso
                        </Button>
                      )}
                      {isMember && <Badge variant="outline">Membro</Badge>}
                      {isPending && pendingRel && (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="hidden sm:inline-flex">
                            Pendente
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
                            onClick={() => handleCancelRequest(pendingRel.id)}
                            disabled={cancellingId === pendingRel.id}
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
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
