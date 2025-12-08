'use client'

import { Puck } from '@measured/puck'
import { useField, useForm, useTheme } from '@payloadcms/ui'
import '@measured/puck/puck.css'
import './PuckEditor.scss'
import './dark-mode.css'
import { useEffect, useState } from 'react'
import { loadTemplatePackage } from '@/lib/loadTemplatePackage'

const initialData = {}

const PuckEditor = ({ tenant }: { tenant: any }) => {
  const { value, setValue } = useField<any>({ path: 'page' })
  const { theme } = useTheme()
  const { value: title, setValue: setTitle } = useField<any>({
    path: 'title',
  })
  const { value: handle, setValue: setHandle } = useField<any>({
    path: 'handle',
  })
  const [config, setConfig] = useState(null)

  useEffect(() => {
    async function loadConfig() {
      const mod = await loadTemplatePackage(tenant.template)
      setConfig(mod.puckConfig)
    }
    loadConfig()
  }, [tenant.template])

  if (!config) return <p>Loading template editor…</p>

  const { submit } = useForm()
  const save = () => {
    submit()
  }
  const onChange = (data: any) => {
    setValue(data)
    if (data.root?.props?.title !== title) {
      setTitle(data.root?.props?.title)
    }
    if (data.root?.props?.handle !== handle) {
      setHandle(data.root?.props?.handle)
    }
  }
  return (
    <div
      className={`twp h-screen w-full overflow-auto ${theme === 'dark' ? 'dark' : ''}`}
      data-theme={theme}
    >
      <Puck
        config={config}
        data={value || initialData}
        onPublish={save}
        onChange={onChange}
        overrides={{
          headerActions: () => <></>,
        }}
      />
    </div>
  )
}

export default PuckEditor
