onRecordUpdate((e) => {
  if (e.hasSuperuserAuth()) return e.next()

  const authId = e.auth?.id
  if (!authId) throw new UnauthorizedError('Authentication required.')

  const record = e.record
  const originalStatus = record.original().getString('status')
  const newStatus = record.getString('status')

  if (originalStatus !== newStatus && (newStatus === 'approved' || newStatus === 'denied')) {
    const groupId = record.getString('group')
    const group = $app.findRecordById('groups', groupId)

    let isAllowed = false

    if (group.getString('owner') === authId) {
      isAllowed = true
    } else {
      try {
        $app.findFirstRecordByFilter(
          'group_members',
          "group = {:group} && user = {:user} && role = 'chefe' && status = 'approved'",
          {
            group: groupId,
            user: authId,
          },
        )
        isAllowed = true
      } catch (_) {}
    }

    if (newStatus === 'denied' && record.getString('user') === authId) {
      isAllowed = true
    }

    if (!isAllowed) {
      throw new ForbiddenError('Only group owners and chefes can approve or deny members.')
    }
  }

  return e.next()
}, 'group_members')
