migrate(
  (app) => {
    const collections = [
      'attendance',
      'giras',
      'list_mediums',
      'lists',
      'mediums',
      'group_members',
      'groups',
      'users',
    ]

    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.truncateCollection(col)
      } catch (_) {
        console.log('Could not truncate collection or collection not found: ' + name)
      }
    }

    const usersCol = app.findCollectionByNameOrId('users')
    try {
      app.findAuthRecordByEmail('users', 'wgkendi@gmail.com')
    } catch (_) {
      const record = new Record(usersCol)
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
    } catch (_) {
      console.log('User wgkendi@gmail.com not found for rollback')
    }
  },
)
