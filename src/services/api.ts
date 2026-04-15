import pb from '@/lib/pocketbase/client'

export const api = {
  groups: {
    listMy: (userId: string) =>
      pb
        .collection('group_members')
        .getFullList({ filter: `user = "${userId}" && status = "approved"`, expand: 'group' }),
    create: (data: any) => pb.collection('groups').create(data),
    join: (userId: string, groupId: string) =>
      pb
        .collection('group_members')
        .create({ user: userId, group: groupId, status: 'pending', role: 'member' }),
    search: (query: string) => pb.collection('groups').getFullList({ filter: `name ~ "${query}"` }),
    getMembers: (groupId: string) =>
      pb
        .collection('group_members')
        .getFullList({ filter: `group = "${groupId}" && status = "pending"`, expand: 'user' }),
    updateMember: (id: string, data: any) => pb.collection('group_members').update(id, data),
  },
  mediums: {
    list: (groupId: string) =>
      pb.collection('mediums').getFullList({ filter: `group = "${groupId}"`, sort: 'name' }),
    create: (formData: FormData) => pb.collection('mediums').create(formData),
    update: (id: string, formData: FormData) => pb.collection('mediums').update(id, formData),
    delete: (id: string) => pb.collection('mediums').delete(id),
  },
  lists: {
    list: (groupId: string) =>
      pb.collection('lists').getFullList({ filter: `group = "${groupId}"` }),
    create: (data: any) => pb.collection('lists').create(data),
    getMediums: (listId: string) =>
      pb.collection('list_mediums').getFullList({ filter: `list = "${listId}"`, expand: 'medium' }),
    addMedium: (listId: string, mediumId: string) =>
      pb.collection('list_mediums').create({ list: listId, medium: mediumId }),
    removeMedium: (id: string) => pb.collection('list_mediums').delete(id),
  },
  giras: {
    list: (groupId: string) =>
      pb.collection('giras').getFullList({ filter: `group = "${groupId}"`, sort: '-date' }),
    get: (id: string) => pb.collection('giras').getOne(id),
    create: async (groupId: string, name: string, date: string, listId?: string) => {
      const gira = await pb
        .collection('giras')
        .create({ group: groupId, name, date, status: 'planned' })
      let mIds: string[] = []
      if (listId) {
        const lm = await pb.collection('list_mediums').getFullList({ filter: `list = "${listId}"` })
        mIds = lm.map((l) => l.medium)
      } else {
        const m = await pb
          .collection('mediums')
          .getFullList({ filter: `group = "${groupId}" && active = true` })
        mIds = m.map((x) => x.id)
      }
      await Promise.all(
        mIds.map((mid) =>
          pb.collection('attendance').create({ gira: gira.id, medium: mid, present: false }),
        ),
      )
      return gira
    },
    update: (id: string, data: any) => pb.collection('giras').update(id, data),
  },
  attendance: {
    list: (giraId: string) =>
      pb
        .collection('attendance')
        .getFullList({
          filter: `gira = "${giraId}"`,
          expand: 'medium',
          sort: 'expand.medium.name',
        }),
    update: (id: string, present: boolean) => pb.collection('attendance').update(id, { present }),
    listForGroup: async (groupId: string) => {
      const giras = await api.giras.list(groupId)
      if (giras.length === 0) return []
      const giraIds = giras.map((g) => `"${g.id}"`).join(',')
      return pb
        .collection('attendance')
        .getFullList({ filter: `gira ?= [${giraIds}]`, expand: 'gira,medium' })
    },
  },
  getFileUrl: (record: any, filename: string) => pb.files.getUrl(record, filename),
}
