const VAR_REGEX = /\[([a-zA-Z0-9_\s]+)\]/g

export function extractVariables(body) {
  const matches = [...body.matchAll(VAR_REGEX)]
  const names = matches.map(m => m[1].trim())
  return [...new Set(names)]
}

export function resolvePrompt(body, values) {
  return body.replace(VAR_REGEX, (match, name) => {
    const key = name.trim()
    return values[key] !== undefined && values[key] !== '' ? values[key] : match
  })
}
