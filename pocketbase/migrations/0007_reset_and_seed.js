migrate(
  (app) => {
    // 1. Clear existing data to provide a clean environment
    const collectionsToClear = [
      'attendance',
      'list_mediums',
      'lists',
      'mediums',
      'group_members',
      'giras',
      'groups',
      '_pb_users_auth_',
    ]

    for (const colName of collectionsToClear) {
      try {
        const col = app.findCollectionByNameOrId(colName)
        app.truncateCollection(col)
      } catch (e) {
        console.log('Could not truncate collection: ' + colName)
      }
    }

    // 2. Initial Seed Data (Admin User)
    const usersCol = app.findCollectionByNameOrId('_pb_users_auth_')
    const admin = new Record(usersCol)
    admin.setEmail('wgkendi@gmail.com')
    admin.setPassword('Skip@Pass')
    admin.set('name', 'Kendi Admin')
    admin.setVerified(true)
    app.save(admin)

    // 3. Sample Seed Data (A Requester User)
    const requester = new Record(usersCol)
    requester.setEmail('requester@example.com')
    requester.setPassword('Skip@Pass')
    requester.set('name', 'Joãozinho da Silva')
    requester.setVerified(true)
    app.save(requester)

    // 4. Sample Seed Data (A Group)
    const groupsCol = app.findCollectionByNameOrId('groups')
    const group = new Record(groupsCol)
    group.set('name', 'Terreiro de Luz')
    group.set('owner', admin.id)
    app.save(group)

    // 5. Link Admin as 'Chefe' of the Group
    const membersCol = app.findCollectionByNameOrId('group_members')
    const adminMember = new Record(membersCol)
    adminMember.set('user', admin.id)
    adminMember.set('group', group.id)
    adminMember.set('role', 'chefe')
    adminMember.set('status', 'approved')
    app.save(adminMember)

    // 6. Create a Pending Request for the Requester User
    const pendingRequest = new Record(membersCol)
    pendingRequest.set('user', requester.id)
    pendingRequest.set('group', group.id)
    pendingRequest.set('role', 'member')
    pendingRequest.set('status', 'pending')
    app.save(pendingRequest)
  },
  (app) => {
    // Revert the seed data (Truncating cannot be easily reverted)
    try {
      const admin = app.findAuthRecordByEmail('_pb_users_auth_', 'wgkendi@gmail.com')
      app.delete(admin)
    } catch (e) {}

    try {
      const requester = app.findAuthRecordByEmail('_pb_users_auth_', 'requester@example.com')
      app.delete(requester)
    } catch (e) {}
  },
)
