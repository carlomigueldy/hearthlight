export type ComponentMap = Record<string, unknown>

export interface Entity {
  id: number
  components: ComponentMap
}
