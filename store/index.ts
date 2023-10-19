import { Module } from '../types/store'
import getters from './getters'
import actions from './actions'
import mutations from './mutations'
import Feed from '../modules/search-feed/store'

const module: Module = {
  state: () => ({
    postIds: [],
    page: 1,
    visiblePosts: {},
    startIndex: 0,
  }),
  modules: {
    Feed,
  },
  getters,
  actions,
  mutations,
  namespaced: true,
}

export default module
