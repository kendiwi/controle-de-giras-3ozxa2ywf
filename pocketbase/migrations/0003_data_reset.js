migrate(
  (app) => {
    const collectionsToClear = [
      'attendance',
      'list_mediums',
      'mediums',
      'giras',
      'lists',
      'group_members',
      'groups',
      'users',
    ]

    for (const name of collectionsToClear) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.truncateCollection(col)
      } catch (e) {
        console.log('Skipping truncation for missing collection: ' + name)
      }
    }

    const users = app.findCollectionByNameOrId('users')

    try {
      app.findAuthRecordByEmail('users', 'wgkendi@gmail.com')
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
      const record = app.findAuthRecordByEmail('users', 'wgkendi@gmail.com')
      app.delete(record)
    } catch (_) {}
  },
)
