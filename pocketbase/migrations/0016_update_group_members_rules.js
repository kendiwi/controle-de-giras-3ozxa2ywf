migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('group_members')

    collection.updateRule =
      '@request.auth.id != "" && (user = @request.auth.id || group.owner = @request.auth.id || (@request.auth.group_members_via_user.group ?= group && @request.auth.group_members_via_user.status ?= "approved" && (@request.auth.group_members_via_user.role ?= "chefe" || @request.auth.group_members_via_user.role ?= "admin")))'

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('group_members')

    collection.updateRule =
      '@request.auth.id != "" && (user = @request.auth.id || (@request.auth.group_members_via_user.group ?= group && @request.auth.group_members_via_user.status ?= "approved" && (@request.auth.group_members_via_user.role ?= "chefe" || @request.auth.group_members_via_user.role ?= "admin")))'

    app.save(collection)
  },
)
