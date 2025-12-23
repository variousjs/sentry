export const ignoreErrors = [
  /ResizeObserver loop/i,
  /extension:\/\//i,
  /Script error/i,
  /NotAllowedError/i,
]

export const defaultWhiteScreenChecker = () => {
  return document.querySelector('#root')?.innerHTML === '' ||
    document.querySelector('#app')?.innerHTML === ''
}
