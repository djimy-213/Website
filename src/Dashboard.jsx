import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setTasks(data || [])
  }

  const loadProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    if (data?.full_name) setFullName(data.full_name)
  }

  useEffect(() => {
    loadTasks()
    loadProfile()
  }, [])

  const addTask = async (e) => {
    e.preventDefault()
    const { error } = await supabase.from('tasks').insert({ title })
    if (error) setError(error.message)
    setTitle('')
    loadTasks()
  }

  const toggleTask = async (task) => {
    await supabase.from('tasks').update({ done: !task.done }).eq('id', task.id)
    loadTasks()
  }

  const deleteTask = async (id) => {
    await supabase.from('tasks').delete().eq('id', id)
    loadTasks()
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div>
      <div className="header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome, {fullName || user.email}</p>
        </div>
        <button onClick={logout}>Log out</button>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="stats">
        <div className="card">Total: {tasks.length}</div>
        <div className="card">Done: {tasks.filter((t) => t.done).length}</div>
        <div className="card">Pending: {tasks.filter((t) => !t.done).length}</div>
      </div>

      <form onSubmit={addTask} className="row-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New task"
          required
        />
        <button>Add</button>
      </form>

      <ul>
        {tasks.map((t) => (
          <li key={t.id}>
            <input
              type="checkbox"
              checked={t.done || false}
              onChange={() => toggleTask(t)}
            />
            <span style={{ textDecoration: t.done ? 'line-through' : 'none' }}>
              {t.title}
            </span>
            <button className="danger" onClick={() => deleteTask(t.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}