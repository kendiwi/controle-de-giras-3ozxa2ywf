migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'wgkendi@gmail.com')
    } catch (_) {
      user = new Record(users)
      user.setEmail('wgkendi@gmail.com')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Admin Coordenador')
      app.save(user)
    }

    const groups = app.findCollectionByNameOrId('groups')
    let group
    try {
      group = app.findFirstRecordByData('groups', 'name', 'Terreiro Pai João')
    } catch (_) {
      group = new Record(groups)
      group.set('name', 'Terreiro Pai João')
      group.set('owner', user.id)
      app.save(group)

      const group_members = app.findCollectionByNameOrId('group_members')
      const member = new Record(group_members)
      member.set('user', user.id)
      member.set('group', group.id)
      member.set('role', 'admin')
      member.set('status', 'approved')
      app.save(member)

      const mediums = app.findCollectionByNameOrId('mediums')
      const names = ['João da Silva', 'Maria Fernandes', 'Carlos Pereira', 'Ana Souza']
      const mediumIds = []
      for (const name of names) {
        const m = new Record(mediums)
        m.set('group', group.id)
        m.set('name', name)
        m.set('active', true)
        app.save(m)
        mediumIds.push(m.id)
      }

      const lists = app.findCollectionByNameOrId('lists')
      const list = new Record(lists)
      list.set('group', group.id)
      list.set('name', 'Corrente Principal')
      app.save(list)

      const list_mediums = app.findCollectionByNameOrId('list_mediums')
      // Add first 3 to list
      for (let i = 0; i < 3; i++) {
        const lm = new Record(list_mediums)
        lm.set('list', list.id)
        lm.set('medium', mediumIds[i])
        app.save(lm)
      }

      const giras = app.findCollectionByNameOrId('giras')
      const gira = new Record(giras)
      gira.set('group', group.id)
      gira.set('name', 'Gira de Pretos Velhos')
      const d = new Date()
      d.setHours(20, 0, 0, 0)
      gira.set('date', d.toISOString())
      gira.set('status', 'planned')
      app.save(gira)

      const attendance = app.findCollectionByNameOrId('attendance')
      for (let i = 0; i < 3; i++) {
        const att = new Record(attendance)
        att.set('gira', gira.id)
        att.set('medium', mediumIds[i])
        att.set('present', false)
        app.save(att)
      }
    }
  },
  (app) => {
    // Irreversible seed or manual cleanup
  },
)
