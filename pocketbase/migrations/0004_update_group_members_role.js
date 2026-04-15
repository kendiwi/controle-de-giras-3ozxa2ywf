migrate(
  (app) => {
    app.db().newQuery("UPDATE group_members SET role = 'chefe' WHERE role = 'admin'").execute()

    const col = app.findCollectionByNameOrId('group_members')

    col.fields.add(
      new SelectField({
        name: 'role',
        values: ['chefe', 'member'],
        maxSelect: 1,
      }),
    )

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('group_members')

    col.fields.add(
      new SelectField({
        name: 'role',
        values: ['admin', 'member'],
        maxSelect: 1,
      }),
    )

    app.save(col)

    app.db().newQuery("UPDATE group_members SET role = 'admin' WHERE role = 'chefe'").execute()
  },
)
