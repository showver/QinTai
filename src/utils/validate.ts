// export const isValidUsername = (str: string) => ['admin', 'editor', 'showver'].indexOf(str.trim()) >= 0
export const isValidUsername = (str: string) => /^[0-9a-zA-Z]+$/.test(str)

export const isExternal = (path: string) => /^(https?:|mailto:|tel:)/.test(path)
