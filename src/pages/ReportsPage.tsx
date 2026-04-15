import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { useActiveGroup } from '@/contexts/ActiveGroupContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download, TrendingUp, TrendingDown, Users } from 'lucide-react'
import { format } from 'date-fns'

export default function ReportsPage() {
  const { activeGroup } = useActiveGroup()
  const [giras, setGiras] = useState<any[]>([])
  const [mediums, setMediums] = useState<any[]>([])
  const [attendances, setAttendances] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (activeGroup) {
      Promise.all([
        api.giras.list(activeGroup.id),
        api.mediums.list(activeGroup.id),
        api.attendance.listForGroup(activeGroup.id),
      ]).then(([g, m, a]) => {
        // Only finalized or past giras for reports makes more sense, but let's show all
        const sortedGiras = g.sort(
          (x, y) => new Date(x.date).getTime() - new Date(y.date).getTime(),
        )
        setGiras(sortedGiras)
        setMediums(m)
        setAttendances(a)
        setLoading(false)
      })
    }
  }, [activeGroup])

  const handleExport = () => {
    let csv = 'Medium,' + giras.map((g) => format(new Date(g.date), 'dd/MM/yy')).join(',') + '\n'
    mediums.forEach((m) => {
      csv +=
        m.name +
        ',' +
        giras
          .map((g) => {
            const att = attendances.find((a) => a.medium === m.id && a.gira === g.id)
            return att?.present ? 'Presente' : 'Falta'
          })
          .join(',') +
        '\n'
    })
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_${activeGroup?.name}.csv`
    a.click()
  }

  if (loading)
    return <div className="p-10 text-center text-muted-foreground">Analisando dados...</div>

  // Stats
  let mostPresent = { name: '-', count: -1 }
  let mostAbsent = { name: '-', count: -1 }
  mediums.forEach((m) => {
    const mAtts = attendances.filter((a) => a.medium === m.id)
    const pCount = mAtts.filter((a) => a.present).length
    const aCount = mAtts.filter((a) => !a.present).length
    if (pCount > mostPresent.count) mostPresent = { name: m.name, count: pCount }
    if (aCount > mostAbsent.count) mostAbsent = { name: m.name, count: aCount }
  })

  const totalPresences = attendances.filter((a) => a.present).length
  const avg = giras.length ? (totalPresences / giras.length).toFixed(1) : '0'

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">Relatórios</h2>
        <Button size="sm" variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" /> Exportar
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <TrendingUp className="h-6 w-6 text-success mb-2" />
            <p className="text-[10px] uppercase font-bold text-success">Mais Assíduo</p>
            <p className="font-bold text-sm leading-tight mt-1">{mostPresent.name}</p>
          </CardContent>
        </Card>
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <TrendingDown className="h-6 w-6 text-destructive mb-2" />
            <p className="text-[10px] uppercase font-bold text-destructive">Mais Faltoso</p>
            <p className="font-bold text-sm leading-tight mt-1">{mostAbsent.name}</p>
          </CardContent>
        </Card>
        <Card className="col-span-2">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-muted-foreground">
                  Média por Gira
                </p>
                <p className="font-bold text-lg">{avg} médiuns</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-bold text-sm">Matriz de Presença</h3>
        </div>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="p-3 font-semibold text-muted-foreground min-w-[120px] sticky left-0 bg-card z-10">
                  Médium
                </th>
                {giras.map((g) => (
                  <th
                    key={g.id}
                    className="p-3 font-semibold text-muted-foreground text-center whitespace-nowrap"
                  >
                    {format(new Date(g.date), 'dd/MM')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {mediums.map((m) => (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/50">
                  <td className="p-3 font-medium sticky left-0 bg-card/95 backdrop-blur z-10 truncate max-w-[120px]">
                    {m.name}
                  </td>
                  {giras.map((g) => {
                    const att = attendances.find((a) => a.medium === m.id && a.gira === g.id)
                    return (
                      <td key={g.id} className="p-3 text-center">
                        {att ? (
                          att.present ? (
                            <span className="text-success text-lg leading-none">●</span>
                          ) : (
                            <span className="text-destructive text-lg leading-none">○</span>
                          )
                        ) : (
                          '-'
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
