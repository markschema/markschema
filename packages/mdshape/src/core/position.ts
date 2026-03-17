export type TypeMdPoint = {
  line: number
  column: number
  offset?: number
}

export type TypeMdPosition = {
  start: TypeMdPoint
  end?: TypeMdPoint
}

export const lineFromPosition = (position?: TypeMdPosition): number | undefined => {
  return position?.start?.line
}

export const positionFromLine = (line?: number): TypeMdPosition | undefined => {
  if (line === undefined) {
    return undefined
  }

  return {
    start: {
      line,
      column: 1,
    },
  }
}

