import { chunk } from 'lodash'
import { VirtualizationConfig } from '../config'
import { Getters } from '../types/store'

const getters: Getters = {
  postIds: (state) => state.postIds,
  postIdsLength: (s, getters) => getters.postIds.length,
  postBlocks: (s, getters) => chunk(getters.postIds, 9).flatMap((item) => chunk(item, 6)),
  startIndex: (state) => state.startIndex,
  wrapperPaddingTop: (s, getters) => getters.startIndex * VirtualizationConfig.BLOCK_HEIGHT,
  wrapperPaddingBottom: (s, getters) => {
    const bottomPostsCount =
      getters.postBlocks.length - getters.startIndex - VirtualizationConfig.VISIBLE_BLOCKS_COUNT
    const padding = bottomPostsCount * VirtualizationConfig.BLOCK_HEIGHT
    return padding > 0 ? padding : 0
  },
  visiblePosts: (state) => state.visiblePosts,
  visibleBlocks: (s, getters) =>
    getters.postBlocks.slice(
      getters.startIndex,
      getters.startIndex + VirtualizationConfig.VISIBLE_BLOCKS_COUNT
    ),
}

export default getters
