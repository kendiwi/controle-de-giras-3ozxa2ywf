migrate(
  (app) => {
    const collections = [
      'attendance',
      'list_mediums',
      'lists',
      'mediums',
      'giras',
      'group_members',
      'groups',
    ]

    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.truncateCollection(col)
      } catch (_) {}
    }

    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'wgkendi@gmail.com')
    } catch (_) {
      const record = new Record(users)
      record.setEmail('wgkendi@gmail.com')
      record.setPassword('Skip@Pass')
      record.setVerified(true)
      record.set('name', 'Admin')
      app.save(record)
    }
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'wgkendi@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
