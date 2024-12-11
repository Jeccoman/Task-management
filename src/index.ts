import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'

// Define the Task type
type Task = {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate: Date | null
  assignedTo: string | null
  createdAt: Date
  updatedAt: Date
}

// In-memory storage for tasks
const tasks: Map<string, Task> = new Map()

const app = new Elysia()
  .use(swagger())
  .get('/', () => 'Task Management API')
  
  // Get all tasks with optional filtering
  .get('/tasks', ({ query }) => {
    let filteredTasks = Array.from(tasks.values())
    
    if (query.status) {
      filteredTasks = filteredTasks.filter(task => task.status === query.status)
    }
    if (query.priority) {
      filteredTasks = filteredTasks.filter(task => task.priority === query.priority)
    }
    if (query.assignedTo) {
      filteredTasks = filteredTasks.filter(task => task.assignedTo === query.assignedTo)
    }
    
    return filteredTasks
  }, {
    query: t.Object({
      status: t.Optional(t.Union([t.Literal('pending'), t.Literal('in-progress'), t.Literal('completed')])),
      priority: t.Optional(t.Union([t.Literal('low'), t.Literal('medium'), t.Literal('high')])),
      assignedTo: t.Optional(t.String())
    })
  })
  
  // Get task by ID
  .get('/tasks/:id', ({ params: { id } }) => {
    const task = tasks.get(id)
    if (!task) throw new Error('Task not found')
    return task
  })
  
  // Create task
  .post('/tasks', ({ body }) => {
    const id = crypto.randomUUID()
    const task: Task = {
      id,
      ...body,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    tasks.set(id, task)
    return task
  }, {
    body: t.Object({
      title: t.String(),
      description: t.String(),
      priority: t.Union([t.Literal('low'), t.Literal('medium'), t.Literal('high')]),
      dueDate: t.Optional(t.String()),
      assignedTo: t.Optional(t.String())
    })
  })
  
  // Update task
  .put('/tasks/:id', ({ params: { id }, body }) => {
    const task = tasks.get(id)
    if (!task) throw new Error('Task not found')
    
    const updatedTask: Task = {
      ...task,
      ...body,
      updatedAt: new Date()
    }
    tasks.set(id, updatedTask)
    return updatedTask
  }, {
    body: t.Object({
      title: t.Optional(t.String()),
      description: t.Optional(t.String()),
      status: t.Optional(t.Union([t.Literal('pending'), t.Literal('in-progress'), t.Literal('completed')])),
      priority: t.Optional(t.Union([t.Literal('low'), t.Literal('medium'), t.Literal('high')])),
      dueDate: t.Optional(t.Union([t.String(), t.Null()])),
      assignedTo: t.Optional(t.Union([t.String(), t.Null()]))
    })
  })
  
  // Delete task
  .delete('/tasks/:id', ({ params: { id } }) => {
    const task = tasks.get(id)
    if (!task) throw new Error('Task not found')
    tasks.delete(id)
    return { message: 'Task deleted successfully' }
  })
  
  // Get tasks due today
  .get('/tasks/due-today', () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Array.from(tasks.values()).filter(task => {
      if (!task.dueDate) return false
      const dueDate = new Date(task.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate.getTime() === today.getTime()
    })
  })
  
  // Get overdue tasks
  .get('/tasks/overdue', () => {
    const now = new Date()
    return Array.from(tasks.values()).filter(task => {
      if (!task.dueDate) return false
      return new Date(task.dueDate) < now && task.status !== 'completed'
    })
  })
  
  // Error handling
  .onError(({ code, error }) => {
    return new Response(error.message, { status: code === 'NOT_FOUND' ? 404 : 500 })
  })
  
  .listen(3000)

console.log(`🦊 Enhanced Task Management API is running at ${app.server?.hostname}:${app.server?.port}`)

