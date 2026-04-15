migrate(
  (app) => {
    const membersCol = app.findCollectionByNameOrId('group_members')

    membersCol.fields.add(
      new SelectField({
        name: 'role',
        values: ['chefe', 'admin', 'member'],
      }),
    )

    // Secure group_members rules
    membersCol.createRule =
      "@request.auth.id != '' && user = @request.auth.id && ( (role = 'chefe' && status = 'approved' && @collection.groups.id ?= group && @collection.groups.owner ?= @request.auth.id) || (role = 'member' && status = 'pending') )"

    membersCol.updateRule =
      "@request.auth.id != '' && @collection.group_members.group ?= group && @collection.group_members.user ?= @request.auth.id && @collection.group_members.status ?= 'approved' && (@collection.group_members.role ?= 'chefe' || @collection.group_members.role ?= 'admin')"

    membersCol.deleteRule =
      "@request.auth.id != '' && (user = @request.auth.id || (@collection.group_members.group ?= group && @collection.group_members.user ?= @request.auth.id && @collection.group_members.status ?= 'approved' && (@collection.group_members.role ?= 'chefe' || @collection.group_members.role ?= 'admin')))"

    app.save(membersCol)

    const groupsCol = app.findCollectionByNameOrId('groups')

    groupsCol.updateRule =
      "@request.auth.id != '' && (owner = @request.auth.id || (@collection.group_members.group ?= id && @collection.group_members.user ?= @request.auth.id && @collection.group_members.status ?= 'approved' && @collection.group_members.role ?= 'admin'))"

    groupsCol.deleteRule = "@request.auth.id != '' && owner = @request.auth.id"

    app.save(groupsCol)
  },
  (app) => {
    const membersCol = app.findCollectionByNameOrId('group_members')

    membersCol.fields.add(
      new SelectField({
        name: 'role',
        values: ['chefe', 'member'],
      }),
    )

    membersCol.createRule = "@request.auth.id != ''"
    membersCol.updateRule = "@request.auth.id != ''"
    membersCol.deleteRule = "@request.auth.id != ''"
    app.save(membersCol)

    const groupsCol = app.findCollectionByNameOrId('groups')
    groupsCol.updateRule = "@request.auth.id != ''"
    groupsCol.deleteRule = "@request.auth.id != ''"
    app.save(groupsCol)
  },
)
