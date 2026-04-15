import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { useActiveGroup } from '@/contexts/ActiveGroupContext'

export default function Index() {
  const { user, loading } = useAuth()
  const { activeGroup } = useActiveGroup()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!user) {
      navigate('/auth', { replace: true })
    } else if (!activeGroup) {
      navigate('/groups', { replace: true })
    } else {
      navigate('/giras', { replace: true })
    }
  }, [user, loading, activeGroup, navigate])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  )
}
