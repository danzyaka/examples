<template>
  <VGrid :length="postIdsLength" is-infinite @infinite="loadPosts">
    <div :class="$style.wrapper" :style="wrapperStyles">
      <SearchPostsBlock
        v-for="(postIds, index) in visibleBlocks"
        :key="getKey(postIds)"
        :class="$style.block"
        :post-ids="postIds"
        :type="getBlockType(index)"
        :id="index"
        :ref="`block-${index}`"
      />
    </div>
    <template #placeholder>
      <PSearchPostsBlock v-for="i in 4" :key="i" :index="i" :type="getBlockType(i)" />
    </template>
  </VGrid>
</template>

<script>
import Vue from 'vue'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import { debounce } from 'lodash'
import VGrid from '@layouts/VGrid.vue'
import Config from '@config/index'
import PSearchPostsBlock from '@placeholders/PSearchPostsBlock.vue'
import SearchPostsBlock from './components/SearchPostsBlock.vue'
import { GridBlockTypes, VirtualizationConfig } from './config'

const mainWrapper = document.getElementById('main')
let cacheHandlersMapId = null

export default Vue.extend({
  name: 'SearchPosts',
  components: { PSearchPostsBlock, SearchPostsBlock, VGrid },
  computed: {
    ...mapGetters('Search/Posts', [
      'postIds',
      'postIdsLength',
      'visibleBlocks',
      'visiblePosts',
      'wrapperPaddingTop',
      'wrapperPaddingBottom',
      'postBlocks',
      'startIndex',
    ]),
    ...mapGetters('Search', ['searchQuery']),
    wrapperStyles() {
      return {
        paddingTop: `${this.wrapperPaddingTop}px`,
        paddingBottom: `${this.wrapperPaddingBottom}px`,
      }
    },
    blockTypes() {
      return {
        1: GridBlockTypes.BIG_LEFT,
        3: GridBlockTypes.BIG_RIGHT,
      }
    },
  },
  methods: {
    ...mapActions('Search/Posts', ['getPosts']),
    ...mapMutations('Search/Posts', [
      'resetVisiblePosts',
      'resetPosts',
      'setPosts',
      'setVisiblePosts',
      'setStartIndex',
    ]),
    async loadPosts(scroll) {
      await this.getPosts(scroll)
    },
    addCacheHandler() {
      cacheHandlersMapId = this.$cacheManager.add({
        regExpURL: Config.URLRegExps.SEARCH_POSTS,
        cacheHandlers: [(posts) => this.setPosts(posts ?? [])],
      })
    },
    deleteCacheHandler() {
      if (cacheHandlersMapId) {
        this.$cacheManager.remove([cacheHandlersMapId])
      }
    },
    async refreshSearch() {
      this.resetPosts()
      await this.getPosts()
    },
    onInputSearchQuery: debounce(this.refreshSearch.bind(this), 250),
    scrollListener(event) {
      const fourBlocksHeight = VirtualizationConfig.BLOCK_HEIGHT * VirtualizationConfig.SCROLL_STEP
      const scrollTopPadding = event.target.scrollTop - fourBlocksHeight
      const scrollTop = scrollTopPadding > 0 ? scrollTopPadding : 0
      const startIndex = Math.floor(scrollTop / fourBlocksHeight) * VirtualizationConfig.SCROLL_STEP
      this.checkStartIndex(startIndex)
    },
    checkStartIndex(index) {
      if (this.startIndex !== index) {
        this.setStartIndex(index)
      }
    },
    connectScrollWatcher() {
      mainWrapper.addEventListener('scroll', this.scrollListener)
    },
    deleteScrollWatcher() {
      mainWrapper.removeEventListener('scroll', this.scrollListener)
    },
    getBlockType(index) {
      return this.blockTypes[index % 4] ?? GridBlockTypes.COMMON
    },
    getKey(postIds) {
      return `block-${postIds[0]}`
    },
  },
  watch: {
    visibleBlocks: {
      handler() {
        this.setVisiblePosts(this.visibleBlocks.flat())
      },
      immediate: true,
    },
  },
  created() {
    this.addCacheHandler()
  },
  mounted() {
    this.connectScrollWatcher()
    this.$bus.$on('search-input-input', this.onInputSearchQuery)
    this.$bus.$on('search-input-close', this.onInputSearchQuery)
  },
  beforeDestroy() {
    this.deleteCacheHandler()
    this.deleteScrollWatcher()
    this.$bus.$off('search-input-input')
    this.$bus.$off('search-input-close')
  },
})
</script>
<style module lang="scss">
.wrapper {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
</style>
