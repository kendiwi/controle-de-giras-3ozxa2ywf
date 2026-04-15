onRecordAfterCreateSuccess((e) => {
  const group = e.record
  const ownerId = group.getString('owner')

  if (ownerId) {
    const membersCollection = $app.findCollectionByNameOrId('group_members')
    const memberRecord = new Record(membersCollection)
    memberRecord.set('user', ownerId)
    memberRecord.set('group', group.id)
    memberRecord.set('role', 'chefe')
    memberRecord.set('status', 'approved')
    $app.save(memberRecord)
  }

  return e.next()
}, 'groups')
