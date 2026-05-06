import { computed, ref } from 'vue'
import { http } from '@/utils'

export type Option = { id: string; label: string }

export interface PropertyPanelProps {
  lf: any
  data: any
}

export interface PropertyPanelEmits {
  (e: 'change'): void
}

export const useElementText = (props: PropertyPanelProps) => {
  return computed<string>(() => {
    const t = props.data?.text
    if (typeof t === 'string') return t
    return t?.value ?? ''
  })
}

export const updateElementText = (props: PropertyPanelProps, emit: PropertyPanelEmits, value: string) => {
  if (props.lf && props.data?.id) {
    props.lf.updateText(props.data.id, value)
  }
  if (props.data) {
    if (typeof props.data.text === 'object' && props.data.text !== null) {
      props.data.text.value = value
    } else {
      props.data.text = value
    }
  }
  emit('change')
}

export const useProperty = (props: PropertyPanelProps, emit: PropertyPanelEmits) => {
  const elementText = useElementText(props)

  const doUpdateProperty = (key: string, value: any) => {
    if (!props.data) return
    if (!props.data.properties) props.data.properties = {}
    props.data.properties[key] = value
    if (props.lf && props.data.id) {
      props.lf.setProperties(props.data.id, { ...props.data.properties })
    }
    emit('change')
  }

  const doUpdateElementText = (value: string) => {
    updateElementText(props, emit, value)
  }

  const makeArrayProp = (key: string) =>
    computed<string[]>({
      get: () => {
        const v = props.data?.properties?.[key]
        return typeof v === 'string' && v ? v.split(',').filter(Boolean) : []
      },
      set: (val: string[]) => {
        doUpdateProperty(key, val.join(','))
      }
    })

  return {
    elementText,
    doUpdateProperty,
    doUpdateElementText,
    makeArrayProp
  }
}

export const useSearchOptions = () => {
  const userCache = ref<Map<string, string>>(new Map())
  const roleCache = ref<Map<string, string>>(new Map())
  const orgCache = ref<Map<string, string>>(new Map())

  const userOptions = ref<Option[]>([])
  const roleOptions = ref<Option[]>([])
  const orgOptions = ref<Option[]>([])

  const userLoading = ref(false)
  const roleLoading = ref(false)
  const orgLoading = ref(false)

  const mergeSelected = (opts: Option[], selected: string[], cache: Map<string, string>): Option[] => {
    const ids = new Set(opts.map((o) => o.id))
    const merged = [...opts]
    for (const id of selected) {
      if (id && !ids.has(id)) {
        merged.push({ id, label: cache.get(id) ?? id })
      }
    }
    return merged
  }

  const searchUsers = async (query: string) => {
    userLoading.value = true
    try {
      const result = await http.post('/user/queryPage', { current: 1, size: 50, search: query || '' })
      const records: any[] = result?.records || []
      userOptions.value = records.map((u: any) => {
        const id = String(u.id)
        const label = u.nickname ? `${u.nickname}(${u.username})` : u.username
        userCache.value.set(id, label)
        return { id, label }
      })
    } finally {
      userLoading.value = false
    }
  }

  const searchRoles = async (query: string) => {
    roleLoading.value = true
    try {
      const result = await http.post('/role/queryPage', { current: 1, size: 50, search: query || '' })
      const records: any[] = result?.records || []
      roleOptions.value = records.map((r: any) => {
        const id = String(r.id)
        const label = r.name
        roleCache.value.set(id, label)
        return { id, label }
      })
    } finally {
      roleLoading.value = false
    }
  }

  const searchOrgs = async (query: string) => {
    orgLoading.value = true
    try {
      const result = await http.post('/org/queryPage', { current: 1, size: 50, search: query || '' })
      const records: any[] = result?.records || []
      orgOptions.value = records.map((o: any) => {
        const id = String(o.id)
        const label = o.name
        orgCache.value.set(id, label)
        return { id, label }
      })
    } finally {
      orgLoading.value = false
    }
  }

  return {
    userCache,
    roleCache,
    orgCache,
    userOptions,
    roleOptions,
    orgOptions,
    userLoading,
    roleLoading,
    orgLoading,
    mergeSelected,
    searchUsers,
    searchRoles,
    searchOrgs
  }
}
