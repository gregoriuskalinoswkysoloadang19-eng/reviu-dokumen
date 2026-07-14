import { useEffect, useState } from 'react'
import Head from 'next/head'
import Layout from '@/components/Layout'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  email: string
  nama: string
  role: string
  aktif: boolean
  created_at: string
}

type PendingUser = {
  id: string
  email: string
  nama: string
  role: string
  created_at: string
}

const ROLE_LABEL: Record<string,string> = { admin:'Administrator', operator:'Operator', pimpinan:'Pimpinan' }
const ROLE_COLOR: Record<string,string> = { admin:'bg-purple-100 text-purple-700', operator:'bg-blue-100 text-blue-700', pimpinan:'bg-amber-100 text-amber-700' }

export default function PenggunaPage() {
  const [users, setUsers] = useState<User[]>([])
  const [pending, setPending] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [currentRole, setCurrentRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState({type:'', text:''})
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ email:'', nama:'', role:'operator', password:'' })

  useEffect(()=>{ fetchAll() },[])

  async function fetchAll() {
    setLoading(true)
    // Cek role user saat ini
    const {data:{user}} = await supabase.auth.getUser()
    if(user) {
      const {data:me} = await supabase.from('users').select('role').eq('id',user.id).single()
      setCurrentRole(me?.role||'')
    }
    // Ambil semua user aktif
    const {data:uData} = await supabase.from('users').select('*').order('created_at',{ascending:false})
    setUsers(uData||[])
    // Ambil pending users (permohonan akses)
    const {data:pData} = await supabase.from('pending_users').select('*').order('created_at',{ascending:false})
    setPending(pData||[])
    setLoading(false)
  }

  function setF(k:string,v:string){setForm(f=>({...f,[k]:v}))}
  function showMsg(type:string, text:string){ setMsg({type,text}); setTimeout(()=>setMsg({type:'',text:''}),4000) }

  async function handleTambahUser(e:React.FormEvent) {
    e.preventDefault()
    if(!form.email||!form.nama||!form.password){showMsg('error','Semua field wajib diisi');return}
    if(form.password.length < 6){showMsg('error','Password minimal 6 karakter');return}
    setSaving(true)

    // Buat user di Supabase Auth menggunakan Admin API via edge function
    // Karena keterbatasan client-side, kita simpan ke pending_users dulu
    const {error} = await supabase.from('pending_users').insert({
      email: form.email, nama: form.nama, role: form.role,
      password_plain: form.password // Akan diproses admin
    })
    if(error){
      // Jika tabel pending_users tidak ada, tampilkan instruksi manual
      showMsg('error', 'Gunakan cara manual: Supabase > Authentication > Add User')
    } else {
      showMsg('success', `Permohonan akun untuk ${form.email} telah disimpan. Admin dapat mengaktifkan di bawah.`)
      setForm({email:'',nama:'',role:'operator',password:''})
      setShowForm(false)
      fetchAll()
    }
    setSaving(false)
  }

  async function handleApprove(p: PendingUser) {
    setSaving(true)
    // Instruksikan admin untuk buat manual, atau gunakan Supabase dashboard
    showMsg('info', `Untuk mengaktifkan ${p.email}: Buka Supabase > Authentication > Add User, lalu masukkan email & password dari permohonan ini.`)
    setSaving(false)
  }

  async function handleReject(p: PendingUser) {
    if(!confirm(`Tolak permohonan akses dari ${p.email}?`)) return
    await supabase.from('pending_users').delete().eq('id', p.id)
    showMsg('success', `Permohonan ${p.email} ditolak dan dihapus.`)
    fetchAll()
  }

  async function handleToggleAktif(u: User) {
    setSaving(true)
    const {error} = await supabase.from('users').update({aktif: !u.aktif}).eq('id', u.id)
    if(error) showMsg('error', 'Gagal update status: '+error.message)
    else showMsg('success', `Akun ${u.nama} ${!u.aktif?'diaktifkan':'dinonaktifkan'}.`)
    fetchAll(); setSaving(false)
  }

  async function handleChangeRole(u: User, newRole: string) {
    const {error} = await supabase.from('users').update({role: newRole}).eq('id', u.id)
    if(error) showMsg('error', 'Gagal ubah role')
    else { showMsg('success', `Role ${u.nama} diubah ke ${ROLE_LABEL[newRole]}`); fetchAll() }
  }

  async function handleHapusUser(u: User) {
    if(!confirm(`Hapus akun ${u.nama} (${u.email})? Mereka tidak bisa login lagi.`)) return
    const {error} = await supabase.from('users').delete().eq('id', u.id)
    if(error) showMsg('error','Gagal hapus: '+error.message)
    else showMsg('success', `Akun ${u.nama} dihapus dari daftar pengguna.`)
    fetchAll()
  }

  if(loading) return <Layout><div className="flex justify-center items-center h-64"><div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div></Layout>

  if(currentRole !== 'admin') return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h2 className="text-lg font-medium text-gray-700">Akses Terbatas</h2>
          <p className="text-sm text-gray-500 mt-1">Halaman ini hanya dapat diakses oleh Administrator.</p>
        </div>
      </div>
    </Layout>
  )

  return (
    <>
      <Head><title>Manajemen Pengguna — DRES | Inspectorate of West Sumba Regency</title></Head>
      <Layout>
        <div className="space-y-6 max-w-4xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Manajemen Pengguna</h1>
              <p className="text-sm text-gray-500">Kelola akun dan hak akses pengguna aplikasi</p>
            </div>
            <button onClick={()=>setShowForm(v=>!v)} className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
              Tambah Pengguna
            </button>
          </div>

          {msg.text && (
            <div className={`rounded-lg p-3 text-sm flex items-start justify-between gap-3 ${msg.type==='error'?'bg-red-50 border border-red-200 text-red-700':msg.type==='info'?'bg-blue-50 border border-blue-200 text-blue-700':'bg-green-50 border border-green-200 text-green-700'}`}>
              <span>{msg.text}</span>
              <button onClick={()=>setMsg({type:'',text:''})} className="flex-shrink-0 opacity-60 hover:opacity-100">✕</button>
            </div>
          )}

          {/* Form Tambah Pengguna */}
          {showForm && (
            <div className="card p-5 border-blue-200 bg-blue-50">
              <h2 className="text-sm font-semibold text-blue-900 mb-4">Form Tambah Pengguna Baru</h2>
              <form onSubmit={handleTambahUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input className="input" value={form.nama} onChange={e=>setF('nama',e.target.value)} placeholder="Nama lengkap pengguna" required/>
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" value={form.email} onChange={e=>setF('email',e.target.value)} placeholder="email@sumbabarat.go.id" required/>
                </div>
                <div>
                  <label className="label">Password (min. 6 karakter)</label>
                  <input type="password" className="input" value={form.password} onChange={e=>setF('password',e.target.value)} placeholder="••••••••" required/>
                </div>
                <div>
                  <label className="label">Role / Hak Akses</label>
                  <select className="input" value={form.role} onChange={e=>setF('role',e.target.value)}>
                    <option value="operator">Operator</option>
                    <option value="pimpinan">Pimpinan</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                  <strong>📋 Cara aktivasi:</strong> Setelah form ini disubmit, buka <strong>Supabase → Authentication → Add User</strong>, masukkan email dan password yang sama, lalu salin UUID ke tabel users via SQL Editor.
                </div>
                <div className="md:col-span-2 flex gap-3 justify-end">
                  <button type="button" onClick={()=>setShowForm(false)} className="btn-secondary">Batal</button>
                  <button type="submit" disabled={saving} className="btn-primary">{saving?'Menyimpan...':'Simpan Permohonan'}</button>
                </div>
              </form>
            </div>
          )}

          {/* Permohonan Akses Pending */}
          {pending.length > 0 && (
            <div className="card">
              <div className="px-5 py-3 border-b border-amber-100 bg-amber-50 rounded-t-xl">
                <h2 className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Permohonan Akses Menunggu Persetujuan ({pending.length})
                </h2>
              </div>
              <div className="divide-y divide-gray-50">
                {pending.map(p=>(
                  <div key={p.id} className="px-5 py-3 flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.nama}</p>
                      <p className="text-xs text-gray-500">{p.email} · Role: {ROLE_LABEL[p.role]||p.role}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(p.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>handleApprove(p)} className="bg-green-600 hover:bg-green-700 text-white text-xs py-1.5 px-3 rounded-lg">
                        Instruksi Aktivasi
                      </button>
                      <button onClick={()=>handleReject(p)} className="bg-red-100 hover:bg-red-200 text-red-700 text-xs py-1.5 px-3 rounded-lg">
                        Tolak
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daftar Pengguna Aktif */}
          <div className="card">
            <div className="px-5 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">Daftar Pengguna Terdaftar ({users.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500 w-8">No</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Nama</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Email</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Role</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Status</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Terdaftar</th>
                    <th className="text-left px-4 py-2.5 font-medium text-gray-500">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.length===0 ? (
                    <tr><td colSpan={7} className="text-center py-8 text-gray-400">Belum ada pengguna</td></tr>
                  ) : users.map((u,i)=>(
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2.5 text-gray-400">{i+1}</td>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{u.nama}</td>
                      <td className="px-4 py-2.5 text-gray-600">{u.email}</td>
                      <td className="px-4 py-2.5">
                        <select
                          className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white"
                          value={u.role}
                          onChange={e=>handleChangeRole(u, e.target.value)}
                        >
                          <option value="operator">Operator</option>
                          <option value="pimpinan">Pimpinan</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={()=>handleToggleAktif(u)}
                          className={`text-xs px-2 py-1 rounded-full font-medium ${u.aktif!==false?'bg-green-100 text-green-700 hover:bg-green-200':'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                          {u.aktif!==false?'Aktif':'Nonaktif'}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {new Date(u.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'})}
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={()=>handleHapusUser(u)}
                          className="text-red-500 hover:text-red-700 font-medium"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Panduan manual */}
          <div className="card p-5 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">📖 Cara Menambah Pengguna (Manual — 3 Langkah)</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</span>
                <span>Buka <strong>Supabase → Authentication → Users → Add User</strong>, masukkan email dan password pengguna baru</span>
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</span>
                <span>Salin UUID user yang baru dibuat, lalu jalankan SQL berikut di <strong>SQL Editor</strong>:</span>
              </div>
              <div className="ml-8 bg-gray-900 text-green-400 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                {`INSERT INTO public.users (id, email, nama, role, aktif)\nVALUES ('UUID-DISINI', 'email@domain.com', 'Nama', 'operator', true);`}
              </div>
              <div className="flex gap-3">
                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</span>
                <span>Pengguna sudah bisa login. Role dan status aktif bisa diubah langsung dari tabel di atas.</span>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  )
}
