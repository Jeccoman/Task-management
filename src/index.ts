import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'

// Define the Task type
type Task = {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: Date
  updatedAt: Date
}

// In-memory storage for tasks
const tasks: Map<string, Task> = new Map()

const app = new Elysia()
  .use(swagger())
  .get('/', () => 'Task Management API')
  
  // Get all tasks
  .get('/tasks', () => Array.from(tasks.values()))
  
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
      description: t.String()
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
      status: t.Optional(t.Union([
        t.Literal('pending'),
        t.Literal('in-progress'),
        t.Literal('completed')
      ]))
    })
  })
  
  // Delete task
  .delete('/tasks/:id', ({ params: { id } }) => {
    const task = tasks.get(id)
    if (!task) throw new Error('Task not found')
    tasks.delete(id)
    return { message: 'Task deleted successfully' }
  })
  
  // Error handling
  .onError(({ code, error }) => {
    return new Response(error.message, { status: code === 'NOT_FOUND' ? 404 : 500 })
  })
  
  .listen(3000)

console.log(`🦊 Task Management API is running at ${app.server?.hostname}:${app.server?.port}`)