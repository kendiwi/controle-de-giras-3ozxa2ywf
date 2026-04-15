migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('group_members')
    col.addIndex('idx_group_members_user', false, 'user', '')
    col.addIndex('idx_group_members_group', false, 'group', '')
    col.addIndex('idx_group_members_status', false, 'status', '')
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('group_members')
    col.removeIndex('idx_group_members_user')
    col.removeIndex('idx_group_members_group')
    col.removeIndex('idx_group_members_status')
    app.save(col)
  },
)
