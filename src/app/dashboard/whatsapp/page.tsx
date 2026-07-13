'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useWorkspace } from '@/lib/workspace-context'

export default function WhatsAppPage() {
  const { workspace } = useWorkspace()
  const [tab, setTab] = useState<'enviar' | 'plantillas' | 'historial'>('enviar')
  const [templates, setTemplates] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Send form
  const [phone, setPhone] = useState('')
  const [selectedLead, setSelectedLead] = useState('')
  const [message, setMessage] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')
  const [sending, setSending] = useState(false)
  const [sentLink, setSentLink] = useState('')

  // Template form
  const [tmplName, setTmplName] = useState('')
  const [tmplContent, setTmplContent] = useState('')
  const [tmplVars, setTmplVars] = useState('')
  const [creatingTmpl, setCreatingTmpl] = useState(false)

  const loadData = async () => {
    if (!workspace?.id) return
    setLoading(true)
    const [tRes, mRes, lRes] = await Promise.all([
      fetch(`/api/whatsapp/templates?workspaceId=${workspace.id}`),
      fetch(`/api/whatsapp/messages?workspaceId=${workspace.id}`),
      fetch(`/api/pipeline/leads?workspaceId=${workspace.id}`),
    ])
    const tData = await tRes.json()
    const mData = await mRes.json()
    const lData = await lRes.json()
    setTemplates(tData.templates || [])
    setMessages(mData.messages || [])
    setLeads(lData.leads || [])
    setLoading(false)
  }

  useEffect(() => { loadData() }, [workspace?.id])

  const handleSend = async () => {
    if (!phone && !selectedLead) return
    setSending(true)
    setSentLink('')
    try {
      const lead = selectedLead ? leads.find((l: any) => l.id === selectedLead) : null
      const targetPhone = phone || lead?.phone || ''
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace?.id,
          leadId: selectedLead || null,
          content: message,
          phone: targetPhone,
          templateId: selectedTemplate || null,
        }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setSentLink(data.waLink || '')
      if (data.waLink) window.open(data.waLink, '_blank')
      loadData()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setSending(false)
    }
  }

  const createTemplate = async () => {
    if (!tmplName || !tmplContent) return
    setCreatingTmpl(true)
    try {
      const vars = tmplVars ? tmplVars.split(',').map((v: string) => v.trim()).filter(Boolean) : []
      const res = await fetch('/api/whatsapp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: workspace?.id, name: tmplName, content: tmplContent, variables: vars }),
      })
      const data = await res.json()
      if (!data.success) throw new Error(data.error)
      setTmplName(''); setTmplContent(''); setTmplVars('')
      loadData()
    } catch (err: any) {
      alert('Error: ' + err.message)
    } finally {
      setCreatingTmpl(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Eliminar plantilla?')) return
    await fetch('/api/whatsapp/templates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId: workspace?.id, templateId: id }),
    })
    loadData()
  }

  const fillTemplate = (id: string) => {
    const tmpl = templates.find(t => t.id === id)
    if (tmpl) {
      setSelectedTemplate(id)
      setMessage(tmpl.content)
    }
  }

  return (
    <>
      <Header title="WhatsApp" subtitle="Mensajería para leads y clientes" />

      {/* Tabs */}
      <div className="flex gap-0.5 bg-navy-100 rounded-lg p-0.5 mb-6 w-fit">
        {(['enviar', 'plantillas', 'historial'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              tab === t ? 'bg-white dark:bg-navy-800 text-navy-900 dark:text-white shadow-sm' : 'text-navy-500 hover:text-navy-700 dark:text-navy-300'
            }`}>
            {t === 'enviar' ? 'Enviar mensaje' : t === 'plantillas' ? 'Plantillas' : 'Historial'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-navy-50 rounded-lg animate-pulse" />)}</div>
      ) : tab === 'enviar' && (
        <div className="card p-6 space-y-4">
          <h3 className="font-bold text-navy-900 dark:text-white">Enviar mensaje por WhatsApp</h3>
          <div>
            <label className="label">Cliente (opcional)</label>
            <select className="input" value={selectedLead} onChange={e => {
              setSelectedLead(e.target.value)
              const lead = leads.find((l: any) => l.id === e.target.value)
              if (lead) setPhone(lead.phone || '')
            }}>
              <option value="">Seleccionar cliente...</option>
              {leads.map((l: any) => (
                <option key={l.id} value={l.id}>{l.full_name} - {l.phone}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">O número manual</label>
            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="541112345678" />
          </div>
          <div>
            <label className="label">Plantilla (opcional)</label>
            <div className="flex gap-2">
              <select className="input flex-1" value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}>
                <option value="">Sin plantilla</option>
                {templates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {selectedTemplate && (
                <button onClick={() => fillTemplate(selectedTemplate)} className="btn-outline text-sm px-3">
                  Usar
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="label">Mensaje</label>
            <textarea className="input min-h-[120px]" value={message} onChange={e => setMessage(e.target.value)}
              placeholder="Escribí el mensaje..." />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSend} disabled={sending || (!phone && !selectedLead)} className="btn-gold disabled:opacity-50">
              {sending ? 'Preparando...' : 'Abrir WhatsApp'}
            </button>
            {sentLink && (
              <a href={sentLink} target="_blank" rel="noopener" className="text-sm text-emerald-600 font-medium underline">
                Abrir en WhatsApp →
              </a>
            )}
          </div>
        </div>
      )}

      {tab === 'plantillas' && (
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-bold text-navy-900 mb-4 dark:text-white">Nueva plantilla</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input" value={tmplName} onChange={e => setTmplName(e.target.value)} placeholder="Ej: primer_contacto" />
              </div>
              <div>
                <label className="label">Variables (separadas por coma)</label>
                <input className="input" value={tmplVars} onChange={e => setTmplVars(e.target.value)} placeholder="nombre, propiedad" />
              </div>
              <div className="md:col-span-2">
                <label className="label">Contenido</label>
                <textarea className="input min-h-[100px]" value={tmplContent} onChange={e => setTmplContent(e.target.value)}
                  placeholder="Hola {{nombre}}, vi que te interesa {{propiedad}}..." />
              </div>
            </div>
            <button onClick={createTemplate} disabled={creatingTmpl || !tmplName || !tmplContent}
              className="btn-gold mt-3 disabled:opacity-50">
              {creatingTmpl ? 'Creando...' : 'Crear plantilla'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templates.length === 0 ? (
              <div className="card p-6 text-center text-sm text-navy-400 col-span-2 dark:text-navy-300 dark:text-navy-100">
                Sin plantillas todavía. Creá una para empezar.
              </div>
            ) : templates.map((t: any) => (
              <div key={t.id} className="card p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-navy-900 text-sm dark:text-white">{t.name}</h4>
                  <button onClick={() => deleteTemplate(t.id)} className="text-red-400 hover:text-red-600 text-xs">Eliminar</button>
                </div>
                <p className="text-sm text-navy-600 whitespace-pre-wrap mb-2 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{t.content}</p>
                {t.variables?.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {t.variables.map((v: string) => <span key={v} className="badge bg-indigo-50 text-indigo-600 text-[10px]">{v}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'historial' && (
        <div className="card p-6">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-sm text-navy-400 dark:text-navy-300 dark:text-navy-100">Sin mensajes aún.</div>
          ) : (
            <div className="space-y-2">
              {messages.map((m: any) => (
                <div key={m.id} className="flex items-start gap-3 p-3 bg-navy-50 rounded-lg">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    m.direction === 'sent' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      {m.direction === 'sent'
                        ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51" />
                      }
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-navy-700 dark:text-navy-300 dark:text-navy-100">{m.direction === 'sent' ? 'Enviado' : 'Recibido'}</span>
                      {m.lead_name && <span className="text-xs text-navy-400 dark:text-navy-300 dark:text-navy-100">para {m.lead_name}</span>}
                      {m.property_title && <span className="text-xs text-navy-400 dark:text-navy-300 dark:text-navy-100">· {m.property_title}</span>}
                      <span className="text-[10px] text-navy-400 ml-auto dark:text-navy-300 dark:text-navy-100">{m.created_at ? new Date(m.created_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                    </div>
                    <p className="text-sm text-navy-600 mt-0.5 line-clamp-2 dark:text-navy-400 dark:text-navy-300 dark:text-navy-100">{m.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
