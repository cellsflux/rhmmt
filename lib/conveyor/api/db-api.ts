import { ConveyorApi } from '@/lib/preload/shared'
import { dbIpcSchema } from '@/lib/conveyor/schemas/database-schema'

export class DbApi extends ConveyorApi {
  schema = dbIpcSchema

  getUsers = () => this.invoke('get-users')
  addUser = (user: { name: string; email: string }) => this.invoke('add-user', user)
}
