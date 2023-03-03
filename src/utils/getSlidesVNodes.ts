export function getSlidesVNodes(vNode: any[] | undefined) {
  // Return empty array if there's any node
  if (!vNode) return []

  // Check if the Slides components are added directly without v-for (#72)
  if (vNode[0]?.children === "v-if" || vNode[0]?.type?.name === 'CarouselSlide') return vNode.filter((node: any) => node.type?.name === "CarouselSlide")


  return vNode[0]?.children || []
}
