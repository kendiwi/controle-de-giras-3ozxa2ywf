onRecordUpdate((e) => {
  if (e.hasSuperuserAuth()) return e.next()

  const authId = e.auth?.id
  if (!authId) throw new UnauthorizedError('Authentication required.')

  const record = e.record
  const originalStatus = record.original().getString('status')
  const newStatus = record.getString('status')
  const originalRole = record.original().getString('role')
  const newRole = record.getString('role')

  if (originalStatus !== newStatus || originalRole !== newRole) {
    const groupId = record.getString('group')
    const group = $app.findRecordById('groups', groupId)

    let isAllowed = false

    if (group.getString('owner') === authId) {
      isAllowed = true
    } else {
      try {
        $app.findFirstRecordByFilter(
          'group_members',
          "group = {:group} && user = {:user} && (role = 'chefe' || role = 'admin') && status = 'approved'",
          {
            group: groupId,
            user: authId,
          },
        )
        isAllowed = true
      } catch (_) {}
    }

    if (
      newStatus === 'denied' &&
      record.getString('user') === authId &&
      originalStatus === 'pending'
    ) {
      isAllowed = true
    }

    if (!isAllowed) {
      throw new ForbiddenError('Only group chefes and admins can modify members.')
    }

    if (newRole === 'chefe' && originalRole !== 'chefe') {
      throw new ForbiddenError('Cannot assign chefe role.')
    }

    if (newRole !== 'chefe' && originalRole === 'chefe') {
      throw new ForbiddenError('Cannot demote from chefe role.')
    }
  }

  return e.next()
}, 'group_members')
