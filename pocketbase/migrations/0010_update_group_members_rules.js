migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('group_members')

    col.createRule =
      "@request.auth.id != '' && user = @request.auth.id && role = 'member' && status = 'pending'"
    col.updateRule =
      "@request.auth.id != '' && @collection.group_members.group ?= group && @collection.group_members.user ?= @request.auth.id && @collection.group_members.status ?= 'approved' && (@collection.group_members.role ?= 'chefe' || @collection.group_members.role ?= 'admin')"

    app.save(col)
  },
  (app) => {
    const col = app.findCollectionByNameOrId('group_members')

    col.createRule =
      "@request.auth.id != '' && user = @request.auth.id && ( (role = 'chefe' && status = 'approved' && @collection.groups.id ?= group && @collection.groups.owner ?= @request.auth.id) || (role = 'member' && status = 'pending') )"
    col.updateRule =
      "@request.auth.id != '' && @collection.group_members.group ?= group && @collection.group_members.user ?= @request.auth.id && @collection.group_members.status ?= 'approved' && (@collection.group_members.role ?= 'chefe' || @collection.group_members.role ?= 'admin')"

    app.save(col)
  },
)
