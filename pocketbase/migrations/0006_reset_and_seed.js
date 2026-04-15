migrate(
  (app) => {
    // Make name required in users collection
    const users = app.findCollectionByNameOrId('users')
    const nameField = users.fields.getByName('name')
    if (nameField) {
      nameField.required = true
      app.save(users)
    }

    // Truncate collections to reset data
    const collectionsToClear = [
      'attendance',
      'list_mediums',
      'lists',
      'giras',
      'mediums',
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

    // Seed Initial Admin User
    const adminUser = new Record(users)
    adminUser.setEmail('wgkendi@gmail.com')
    adminUser.setPassword('Skip@Pass')
    adminUser.setVerified(true)
    adminUser.set('name', 'Kendi Admin')
    app.save(adminUser)

    // Seed Second User
    const joaoUser = new Record(users)
    joaoUser.setEmail('joao.silva@example.com')
    joaoUser.setPassword('Skip@Pass')
    joaoUser.setVerified(true)
    joaoUser.set('name', 'João Silva')
    app.save(joaoUser)

    // Seed Groups
    const groups = app.findCollectionByNameOrId('groups')

    const groupA = new Record(groups)
    groupA.set('name', 'Terreiro Luz e Paz')
    groupA.set('owner', adminUser.id)
    app.save(groupA)

    const groupB = new Record(groups)
    groupB.set('name', 'Centro Caminho de Aruanda')
    groupB.set('owner', joaoUser.id)
    app.save(groupB)

    // Seed Group Members
    const groupMembers = app.findCollectionByNameOrId('group_members')

    const member1 = new Record(groupMembers)
    member1.set('user', adminUser.id)
    member1.set('group', groupA.id)
    member1.set('role', 'chefe')
    member1.set('status', 'approved')
    app.save(member1)

    const member2 = new Record(groupMembers)
    member2.set('user', joaoUser.id)
    member2.set('group', groupA.id)
    member2.set('role', 'member')
    member2.set('status', 'pending')
    app.save(member2)

    // Seed Giras
    const giras = app.findCollectionByNameOrId('giras')

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const giraFinalized = new Record(giras)
    giraFinalized.set('group', groupA.id)
    giraFinalized.set('name', 'Gira de Caboclos')
    giraFinalized.set('date', yesterday.toISOString())
    giraFinalized.set('status', 'finalized')
    app.save(giraFinalized)

    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const giraPlanned = new Record(giras)
    giraPlanned.set('group', groupA.id)
    giraPlanned.set('name', 'Gira de Pretos Velhos')
    giraPlanned.set('date', tomorrow.toISOString())
    giraPlanned.set('status', 'planned')
    app.save(giraPlanned)
  },
  (app) => {
    try {
      // Revert name field to not required
      const users = app.findCollectionByNameOrId('users')
      const nameField = users.fields.getByName('name')
      if (nameField) {
        nameField.required = false
        app.save(users)
      }
    } catch (e) {
      // ignore
    }
  },
)
