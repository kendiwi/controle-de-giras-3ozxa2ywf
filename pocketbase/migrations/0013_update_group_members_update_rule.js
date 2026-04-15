migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('group_members')
    col.updateRule =
      "@request.auth.id != '' && (user = @request.auth.id || (@collection.group_members.group ?= group && @collection.group_members.user ?= @request.auth.id && @collection.group_members.status ?= 'approved' && (@collection.group_members.role ?= 'chefe' || @collection.group_members.role ?= 'admin')))"
    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('group_members')
    col.updateRule =
      "@request.auth.id != '' && (user = @request.auth.id || (@request.auth.group_members_via_user.group ?= group && @request.auth.group_members_via_user.status ?= 'approved' && (@request.auth.group_members_via_user.role ?= 'chefe' || @request.auth.group_members_via_user.role ?= 'admin')))"
    app.save(col)
  },
)
