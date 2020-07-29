export type Content = Record<string, string | number | string[]>
export interface View {
  render(): void
  init(data: Content): Promise<void>
  addEventListener(): void
  addCustomEventListener(): void
}
