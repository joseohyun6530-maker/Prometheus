/**
 * @param {unknown} err
 * @returns {string}
 */
export function formatFetchError(err) {
  if (!(err instanceof Error)) {
    return '알 수 없는 오류가 발생했습니다.'
  }

  const message = err.message.trim()
  if (
    message === 'Failed to fetch' ||
    message === 'NetworkError when attempting to fetch resource.' ||
    err.name === 'TypeError'
  ) {
    return '서버에 연결할 수 없습니다. API가 실행 중인지, 주소·CORS 설정을 확인하세요.'
  }

  return message
}

/**
 * @param {unknown} err
 */
export function isNetworkError(err) {
  return err instanceof Error && err.isNetworkError === true
}
