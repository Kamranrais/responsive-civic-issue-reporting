import { useState, useCallback } from 'react'
import { supabase, IS_DEMO } from '../lib/supabase'
import { demoReports } from '../lib/demo'
import { generateComplaintId } from '../lib/utils'

export function useReports() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ─── Fetch all reports ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async (filters = {}) => {
    setLoading(true)
    setError(null)
    try {
      if (IS_DEMO) {
        let reports = demoReports.getAll()
        if (filters.category) reports = reports.filter(r => r.category === filters.category)
        if (filters.severity) reports = reports.filter(r => r.severity === filters.severity)
        if (filters.status)   reports = reports.filter(r => r.status === filters.status)
        if (filters.search)   {
          const q = filters.search.toLowerCase()
          reports = reports.filter(r =>
            r.title?.toLowerCase().includes(q) ||
            r.address?.toLowerCase().includes(q) ||
            r.complaint_id?.toLowerCase().includes(q)
          )
        }
        return reports.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }

      let query = supabase.from('reports').select('*').order('created_at', { ascending: false })
      if (filters.category) query = query.eq('category', filters.category)
      if (filters.severity) query = query.eq('severity', filters.severity)
      if (filters.status)   query = query.eq('status', filters.status)
      if (filters.search)   query = query.or(`title.ilike.%${filters.search}%,address.ilike.%${filters.search}%,complaint_id.ilike.%${filters.search}%`)

      const { data, error } = await query
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Fetch reports by user ──────────────────────────────────────────────────
  const fetchByUser = useCallback(async (userId) => {
    setLoading(true)
    setError(null)
    try {
      if (IS_DEMO) {
        return demoReports.getByUser(userId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Fetch single report ────────────────────────────────────────────────────
  const fetchById = useCallback(async (id) => {
    setLoading(true)
    setError(null)
    try {
      if (IS_DEMO) return demoReports.getById(id)
      const { data, error } = await supabase.from('reports').select('*').eq('id', id).single()
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Create report ──────────────────────────────────────────────────────────
  const createReport = useCallback(async ({ imageFile, reportData }) => {
    setLoading(true)
    setError(null)
    try {
      let image_url = null

      if (!IS_DEMO && imageFile) {
        const ext = imageFile.name.split('.').pop()
        const path = `${reportData.user_id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('report-images')
          .upload(path, imageFile, { upsert: false })
        if (uploadError) throw uploadError
        const { data: { publicUrl } } = supabase.storage.from('report-images').getPublicUrl(path)
        image_url = publicUrl
      } else if (imageFile) {
        // Demo mode: store as data URL (base64)
        image_url = await new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(imageFile)
        })
      }

      const complaint_id = generateComplaintId()
      const payload = {
        ...reportData,
        complaint_id,
        image_url,
        status: 'submitted',
      }

      if (IS_DEMO) {
        return demoReports.create(payload)
      }

      const { data, error } = await supabase.from('reports').insert(payload).select().single()
      if (error) throw error

      // Trigger n8n webhook if configured
      const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
      if (webhookUrl) {
        fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'new_report', report: data }),
        }).catch(console.warn) // fire-and-forget
      }

      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  // ─── Update report (admin) ──────────────────────────────────────────────────
  const updateReport = useCallback(async (id, updates) => {
    setLoading(true)
    setError(null)
    try {
      if (IS_DEMO) return demoReports.update(id, updates)
      const { data, error } = await supabase
        .from('reports')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, fetchAll, fetchByUser, fetchById, createReport, updateReport }
}
