migrate(
  (app) => {
    const groups = new Collection({
      name: 'groups',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'owner', type: 'relation', collectionId: '_pb_users_auth_', maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(groups)

    const group_members = new Collection({
      name: 'group_members',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        {
          name: 'user',
          type: 'relation',
          collectionId: '_pb_users_auth_',
          maxSelect: 1,
          required: true,
        },
        { name: 'group', type: 'relation', collectionId: groups.id, maxSelect: 1, required: true },
        { name: 'role', type: 'select', values: ['admin', 'member'], maxSelect: 1 },
        { name: 'status', type: 'select', values: ['pending', 'approved', 'denied'], maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(group_members)

    const mediums = new Collection({
      name: 'mediums',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'group', type: 'relation', collectionId: groups.id, maxSelect: 1, required: true },
        { name: 'name', type: 'text', required: true },
        {
          name: 'photo',
          type: 'file',
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'active', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(mediums)

    const lists = new Collection({
      name: 'lists',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'group', type: 'relation', collectionId: groups.id, maxSelect: 1, required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(lists)

    const list_mediums = new Collection({
      name: 'list_mediums',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'list', type: 'relation', collectionId: lists.id, maxSelect: 1, required: true },
        {
          name: 'medium',
          type: 'relation',
          collectionId: mediums.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(list_mediums)

    const giras = new Collection({
      name: 'giras',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'group', type: 'relation', collectionId: groups.id, maxSelect: 1, required: true },
        { name: 'name', type: 'text', required: true },
        { name: 'date', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          values: ['planned', 'ongoing', 'finalized'],
          maxSelect: 1,
          required: true,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(giras)

    const attendance = new Collection({
      name: 'attendance',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'gira', type: 'relation', collectionId: giras.id, maxSelect: 1, required: true },
        {
          name: 'medium',
          type: 'relation',
          collectionId: mediums.id,
          maxSelect: 1,
          required: true,
        },
        { name: 'present', type: 'bool' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(attendance)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('attendance'))
    app.delete(app.findCollectionByNameOrId('giras'))
    app.delete(app.findCollectionByNameOrId('list_mediums'))
    app.delete(app.findCollectionByNameOrId('lists'))
    app.delete(app.findCollectionByNameOrId('mediums'))
    app.delete(app.findCollectionByNameOrId('group_members'))
    app.delete(app.findCollectionByNameOrId('groups'))
  },
)
