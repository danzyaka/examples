import { Actions } from '../types/store'
import Config from '../config'

const actions: Actions = {
  async getPosts({ commit, dispatch, state, rootGetters }, scroll: InfiniteType) {
    const params = {
      ...Config.REQUESTS_PARAMS,
      limit: Config.PAGE_LIMIT,
      page: state.page,
      search: rootGetters['Search/searchQuery'],
    }
    const posts = await dispatch('Post/getPosts', params, { root: true })
    commit('pushPosts', posts)
    if (scroll) {
      posts?.length ? scroll.loaded() : scroll.complete()
    }
    return posts
  },
}

export default actions
