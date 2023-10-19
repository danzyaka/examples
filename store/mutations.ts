import Vue from 'vue'
import { Post, PostIds } from '@common-types/post'
import { convertPostsArrayToObjectMap, getPostIds } from '@helpers/posts'
import { getChatIds } from '@helpers/chats'
import PostsCache from '../services/cache'
import { Mutations } from '../types/store'

const mutations: Mutations = {
  setPosts(state, posts) {
    PostsCache.setItems(posts)
    state.postIds = getPostIds(posts)
    state.page = 2
  },
  pushPosts(state, posts) {
    PostsCache.addItems(posts)
    state.postIds.push(...getChatIds(posts))
    state.page += 1
  },
  resetPosts(state) {
    PostsCache.resetCache()
    state.postIds = []
    state.visiblePosts = {}
    state.page = 1
  },
  setPost(state, post: Post) {
    PostsCache.setItem(post)
    state.visiblePosts = { ...state.visiblePosts, [post.id]: post }
  },
  deletePost(state, postId) {
    PostsCache.deleteItem(postId)
    state.postIds = state.postIds.filter((id) => id !== postId)
    Vue.delete(state.visiblePosts, postId)
  },
  setVisiblePosts(state, postIds: PostIds) {
    const posts = PostsCache.getItems(postIds)
    state.visiblePosts = convertPostsArrayToObjectMap(posts)
  },
  resetVisiblePosts(state) {
    state.visiblePosts = {}
  },
  setStartIndex(state, startIndex) {
    state.startIndex = startIndex
  },
}

export default mutations
