<template>
  <div class="website-container">
    <!-- 顶部导航 -->
    <header class="site-header" :class="{ scrolled: isScrolled }">
      <div class="header-content">
        <div class="logo" @click="scrollToTop">
          <svg viewBox="0 0 100 100" class="logo-icon">
            <path d="M50 5C25 5 10 20 10 45c0 15 8 28 20 35v-20c-6-5-10-12-10-20 0-18 12-30 25-30s25 12 25 30c0 8-4 15-10 20v20c12-7 20-20 20-35 0-25-15-40-40-40z" fill="currentColor"/>
            <path d="M38 35v30l12-6v-18l-12-6z" fill="#fff"/>
          </svg>
          <span class="logo-text">心灵视频</span>
        </div>

        <nav class="main-nav">
          <a href="javascript:;" class="nav-link" @click="scrollTo('featured')">精选</a>
          <a href="javascript:;" class="nav-link" @click="scrollTo('categories')">分类</a>
          <a href="javascript:;" class="nav-link" @click="scrollTo('about')">关于</a>
          <a href="javascript:;" class="nav-link" @click="scrollTo('pricing')">定价</a>
        </nav>

        <div class="header-actions">
          <button class="btn btn-outline" @click="showLogin = true">登录</button>
          <button class="btn btn-primary" @click="scrollTo('pricing')">免费注册</button>
          <button class="mobile-menu-btn" :class="{ active: mobileMenuOpen }" @click="mobileMenuOpen = !mobileMenuOpen">
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      <transition name="slide-down">
        <nav class="mobile-nav" v-if="mobileMenuOpen">
          <a href="javascript:;" class="nav-link" @click="scrollTo('featured'); mobileMenuOpen = false">精选</a>
          <a href="javascript:;" class="nav-link" @click="scrollTo('categories'); mobileMenuOpen = false">分类</a>
          <a href="javascript:;" class="nav-link" @click="scrollTo('about'); mobileMenuOpen = false">关于</a>
          <a href="javascript:;" class="nav-link" @click="scrollTo('pricing'); mobileMenuOpen = false">定价</a>
          <div class="mobile-nav-actions">
            <button class="btn btn-primary btn-block" @click="showLogin = true; mobileMenuOpen = false">登录</button>
          </div>
        </nav>
      </transition>
    </header>

    <!-- Hero 横幅 -->
    <section class="hero-section">
      <div class="hero-bg">
        <img
          src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cinematic%20dark%20gradient%20background%20with%20purple%20blue%20neon%20lights%2C%20abstract%20geometric%20shapes%2C%20modern%20technology%20video%20platform%20style%2C%20luxury%20premium%20design&image_size=landscape_16_9"
          alt=""
          loading="eager"
          @error="handleHeroError"
        />
      </div>
      <div class="hero-overlay"></div>
      <div class="hero-content animate-on-scroll" :class="{ animated: heroAnimated }">
        <h1 class="hero-title">发现精彩视频内容</h1>
        <p class="hero-subtitle">探索来自全球创作者的高质量视频作品，开启你的心灵之旅</p>
        <div class="hero-actions">
          <button class="btn btn-primary btn-large" @click="scrollTo('featured')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            开始探索
          </button>
          <button class="btn btn-outline btn-large" @click="scrollTo('about')">了解更多</button>
        </div>
      </div>
      <div class="hero-stats animate-on-scroll" :class="{ animated: heroAnimated }" style="transition-delay: 0.3s">
        <div class="stat">
          <span class="stat-number">{{ animatedStats.videos }}</span>
          <span class="stat-label">视频作品</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-number">{{ animatedStats.creators }}</span>
          <span class="stat-label">创作者</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat">
          <span class="stat-number">{{ animatedStats.visits }}</span>
          <span class="stat-label">月访问量</span>
        </div>
      </div>
    </section>

    <!-- 精选视频 -->
    <section id="featured" class="featured-section">
      <div class="section-container">
        <div class="section-header animate-on-scroll">
          <div>
            <h2 class="section-title">精选视频</h2>
            <p class="section-subtitle">编辑推荐的优质内容</p>
          </div>
          <a href="javascript:;" class="view-all" @click="scrollTo('videos')">
            查看全部
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-arrow">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </div>

        <div class="featured-video animate-on-scroll" @click="openVideo(featuredVideo)">
          <div class="video-cover">
            <img :src="featuredVideo.cover" alt="精选视频" loading="lazy" @error="handleImageError" />
            <div class="play-overlay">
              <button class="play-btn">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
            <div class="featured-badge">精选推荐</div>
          </div>
          <div class="video-info">
            <h3 class="video-title">{{ featuredVideo.title }}</h3>
            <p class="video-description">{{ featuredVideo.description }}</p>
            <div class="video-meta">
              <span class="author">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                {{ featuredVideo.author }}
              </span>
              <span class="views">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                {{ featuredVideo.views }} 次观看
              </span>
              <span class="date">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="meta-icon"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {{ featuredVideo.date }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 内容分类 -->
    <section id="categories" class="categories-section">
      <div class="section-container">
        <div class="section-header animate-on-scroll">
          <div>
            <h2 class="section-title">内容分类</h2>
            <p class="section-subtitle">按类别浏览你感兴趣的内容</p>
          </div>
          <button v-if="selectedCategory" class="btn-reset-filter" @click="selectedCategory = null">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="icon-small"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            清除筛选
          </button>
        </div>

        <div class="categories-grid animate-on-scroll">
          <div v-for="category in categories" :key="category.id"
            class="category-card"
            :class="{ selected: selectedCategory && selectedCategory.id === category.id }"
            @click="selectCategory(category)">
            <div class="category-icon" :style="{ background: category.color }">
              <svg v-if="category.id === 'meditation'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2a7 7 0 0 1 7 7c0 5-7 11-7 11S5 14 5 9a7 7 0 0 1 7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
              <svg v-else-if="category.id === 'sleep'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <svg v-else-if="category.id === 'focus'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <svg v-else-if="category.id === 'white_noise'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
              <svg v-else-if="category.id === 'art'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <svg v-else-if="category.id === 'music'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
            </div>
            <h3 class="category-name">{{ category.name }}</h3>
            <p class="category-count">{{ category.count }} 个视频</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 视频列表 -->
    <section id="videos" class="videos-section">
      <div class="section-container">
        <div class="section-header animate-on-scroll">
          <div>
            <h2 class="section-title">{{ selectedCategory ? selectedCategory.name : '最新上传' }}</h2>
            <p class="section-subtitle" v-if="selectedCategory">已筛选 {{ filteredVideos.length }} 个视频</p>
          </div>
          <div class="filter-tabs">
            <button v-for="tab in filterTabs" :key="tab.id"
              class="filter-tab" :class="{ active: activeFilter === tab.id }"
              @click="activeFilter = tab.id">{{ tab.name }}</button>
          </div>
        </div>

        <transition-group name="video-card" tag="div" class="videos-grid animate-on-scroll">
          <div v-for="video in filteredVideos" :key="video.id" class="video-card" @click="openVideo(video)">
            <div class="video-thumbnail">
              <img :src="video.thumbnail" alt="视频封面" loading="lazy" @error="handleImageError" />
              <div class="duration-badge">{{ video.duration }}</div>
              <div class="hover-overlay">
                <button class="play-btn-small">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </button>
              </div>
            </div>
            <div class="video-content">
              <h4 class="video-card-title">{{ video.title }}</h4>
              <p class="video-card-author">{{ video.author }}</p>
              <div class="video-card-meta">
                <span>{{ video.views }} 观看</span>
                <span>{{ video.date }}</span>
              </div>
            </div>
          </div>
        </transition-group>

        <div v-if="filteredVideos.length === 0" class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="empty-icon"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/><line x1="17" y1="17" x2="22" y2="17"/></svg>
          <p>暂无符合条件的视频</p>
          <button class="btn btn-primary" @click="selectedCategory = null; activeFilter = 'latest'">查看全部视频</button>
        </div>

        <div class="load-more animate-on-scroll" v-if="filteredVideos.length > 0">
          <button class="btn btn-outline btn-dark">加载更多视频</button>
        </div>
      </div>
    </section>

    <!-- 关于我们 -->
    <section id="about" class="about-section">
      <div class="section-container">
        <div class="about-content">
          <div class="about-text animate-on-scroll">
            <h2 class="section-title">为什么选择心灵视频</h2>
            <p class="about-description">我们致力于为创作者和观众打造一个高品质的视频分享平台。</p>
            <div class="features-list">
              <div class="feature-item">
                <div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div>
                <div class="feature-info"><h4>4K 高清画质</h4><p>支持最高 4K 分辨率视频上传和播放</p></div>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg></div>
                <div class="feature-info"><h4>极速加载</h4><p>全球 CDN 加速，毫秒级响应</p></div>
              </div>
              <div class="feature-item">
                <div class="feature-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
                <div class="feature-info"><h4>创作者支持</h4><p>提供专业工具和变现渠道</p></div>
              </div>
            </div>
          </div>
          <div class="about-image animate-on-scroll" style="transition-delay: 0.2s">
            <div class="about-image-wrapper">
              <img src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20video%20studio%20with%20professional%20equipment%2C%20warm%20lighting%2C%20creative%20space&image_size=landscape_16_9" alt="关于我们" loading="lazy" @error="handleImageError" />
              <div class="about-image-decoration"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 定价方案 -->
    <section id="pricing" class="pricing-section">
      <div class="section-container">
        <div class="section-header center animate-on-scroll">
          <div><h2 class="section-title">选择适合您的方案</h2><p class="section-subtitle">灵活的定价方案，满足不同需求</p></div>
        </div>
        <div class="pricing-grid animate-on-scroll">
          <div class="pricing-card">
            <div class="pricing-header"><h3>免费版</h3><p class="pricing-desc">适合个人体验</p><div class="price"><span class="currency">¥</span><span class="amount">0</span><span class="period">/月</span></div></div>
            <ul class="pricing-features"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>10GB 存储空间</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>标准清晰度</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>基础分析数据</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>社区支持</li></ul>
            <button class="btn btn-outline btn-dark" @click="showLogin = true">开始使用</button>
          </div>
          <div class="pricing-card popular">
            <div class="popular-badge">最受欢迎</div>
            <div class="pricing-header"><h3>专业版</h3><p class="pricing-desc">适合专业创作者</p><div class="price"><span class="currency">¥</span><span class="amount">99</span><span class="period">/月</span></div></div>
            <ul class="pricing-features"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>500GB 存储空间</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>4K 超清画质</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>高级分析数据</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>优先客服支持</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>自定义域名</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>无广告体验</li></ul>
            <button class="btn btn-primary" @click="showLogin = true">立即订阅</button>
          </div>
          <div class="pricing-card">
            <div class="pricing-header"><h3>企业版</h3><p class="pricing-desc">适合团队协作</p><div class="price"><span class="currency">¥</span><span class="amount">299</span><span class="period">/月</span></div></div>
            <ul class="pricing-features"><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>无限存储空间</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>4K 超清画质</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>完整分析数据</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>专属客户经理</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>团队协作功能</li><li><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="check-icon"><polyline points="20 6 9 17 4 12"/></svg>企业级安全保障</li></ul>
            <button class="btn btn-outline btn-dark" @click="showLogin = true">联系销售</button>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA 横幅 -->
    <section class="cta-section">
      <div class="section-container">
        <div class="cta-content animate-on-scroll">
          <h2>准备好开始你的创作之旅了吗？</h2>
          <p>加入 50,000+ 创作者，分享你的精彩视频内容</p>
          <div class="cta-actions">
            <button class="btn btn-white btn-large" @click="showLogin = true">立即免费注册</button>
            <button class="btn btn-ghost btn-large" @click="scrollTo('about')">了解更多</button>
          </div>
        </div>
      </div>
    </section>

    <!-- 页脚 -->
    <footer class="site-footer">
      <div class="section-container">
        <div class="footer-content">
          <div class="footer-section footer-brand">
            <div class="logo">
              <svg viewBox="0 0 100 100" class="logo-icon"><path d="M50 5C25 5 10 20 10 45c0 15 8 28 20 35v-20c-6-5-10-12-10-20 0-18 12-30 25-30s25 12 25 30c0 8-4 15-10 20v20c12-7 20-20 20-35 0-25-15-40-40-40z" fill="currentColor"/><path d="M38 35v30l12-6v-18l-12-6z" fill="#fff"/></svg>
              <span class="logo-text">心灵视频</span>
            </div>
            <p class="footer-desc">探索精彩视频内容，发现无限创意可能。</p>
          </div>
          <div class="footer-section"><h4>产品</h4><ul><li><a href="javascript:;" @click="scrollTo('featured')">功能介绍</a></li><li><a href="javascript:;" @click="scrollTo('pricing')">定价方案</a></li><li><a href="javascript:;">API 文档</a></li><li><a href="javascript:;">更新日志</a></li></ul></div>
          <div class="footer-section"><h4>资源</h4><ul><li><a href="javascript:;">帮助中心</a></li><li><a href="javascript:;">创作者指南</a></li><li><a href="javascript:;">社区论坛</a></li><li><a href="javascript:;">博客</a></li></ul></div>
          <div class="footer-section"><h4>公司</h4><ul><li><a href="javascript:;" @click="scrollTo('about')">关于我们</a></li><li><a href="javascript:;">加入我们</a></li><li><a href="javascript:;">联系我们</a></li><li><a href="javascript:;">品牌资源</a></li></ul></div>
          <div class="footer-section"><h4>法律</h4><ul><li><a href="javascript:;">隐私政策</a></li><li><a href="javascript:;">服务条款</a></li><li><a href="javascript:;">版权声明</a></li><li><a href="javascript:;">Cookie 设置</a></li></ul></div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2026 心灵视频. 保留所有权利.</p>
          <div class="social-links">
            <a href="javascript:;" class="social-link" title="微博"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.098 20.323c-3.977.391-7.414-1.406-7.672-4.02-.259-2.609 2.759-5.047 6.74-5.441 3.979-.394 7.413 1.404 7.671 4.018.259 2.6-2.759 5.049-6.739 5.443zm-1.921-5.698c-2.097.576-2.008 2.547-.603 3.396 1.444.87 3.597.494 4.324-.862.724-1.354-.473-3.027-2.503-2.846-.395.039-.82.141-1.218.312zm1.571 1.678c-.398.472-1.089.651-1.533.396-.438-.252-.487-.838-.096-1.304.393-.466 1.072-.642 1.516-.399.444.245.508.832.113 1.307zm.303-.793c-.149.178-.418.237-.594.131-.176-.107-.196-.358-.049-.533.151-.177.414-.235.591-.132.178.104.2.354.052.534zM20.69 11.458c-.491-1.239-1.678-1.896-2.67-1.471-.992.421-1.391 1.676-.897 2.914.155.391.398.717.695.953.134-.43.425-.792.823-.961.676-.286 1.448.014 1.722.67.273.655-.048 1.407-.716 1.681-.238.098-.482.116-.707.066.041.224.053.46.025.703.384.058.785-.001 1.149-.153 1.166-.488 1.702-1.806 1.213-3.035-.029-.071-.065-.138-.099-.205.196-.402.128-.913-.188-1.272a1.15 1.15 0 0 0-.35.11zm-2.196 3.635c-.065-.006-.137.019-.201.076-.084.074-.112.183-.063.273.05.091.157.132.261.103.101-.03.17-.119.165-.221-.006-.127-.073-.224-.162-.231zM20.98 7.553C19.786 5.222 17.378 3.835 14.85 3.835h-.179c-.154-.004-.293.098-.336.248-.043.15.022.31.156.388.133.079.302.058.414-.05.06-.012.119-.02.18-.02 2.166 0 4.222 1.188 5.244 3.183.448.874.642 1.831.593 2.771-.007.137.061.267.179.338.117.072.264.075.385.009a.355.355 0 0 0 .178-.333c.056-1.083-.169-2.185-.684-3.186z"/></svg></a>
            <a href="javascript:;" class="social-link" title="微信"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.238 4.616c-3.965 0-7.163 2.608-7.163 5.828 0 3.222 3.198 5.83 7.163 5.83.752 0 1.488-.098 2.189-.308a.67.67 0 0 1 .553.074l1.46.854a.252.252 0 0 0 .128.04c.124 0 .224-.1.224-.224 0-.055-.023-.11-.037-.163l-.3-1.138a.453.453 0 0 1 .163-.51c1.41-1.036 2.31-2.568 2.31-4.255 0-3.22-3.199-5.828-7.163-5.828h-.527zm-2.372 3.183c.493 0 .893.407.893.908s-.4.908-.893.908a.9.9 0 0 1-.893-.908c0-.501.4-.908.893-.908zm4.748 0c.493 0 .893.407.893.908s-.4.908-.893.908a.9.9 0 0 1-.893-.908c0-.501.4-.908.893-.908z"/></svg></a>
            <a href="javascript:;" class="social-link" title="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>
            <a href="javascript:;" class="social-link" title="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg></a>
          </div>
        </div>
      </div>
    </footer>

    <!-- 登录弹窗 -->
    <el-dialog title="欢迎回来" :model-value="showLogin" @update:model-value="showLogin = $event" width="420px" :close-on-click-modal="false" custom-class="login-dialog">
      <div class="login-dialog-header">
        <svg viewBox="0 0 100 100" class="login-logo"><path d="M50 5C25 5 10 20 10 45c0 15 8 28 20 35v-20c-6-5-10-12-10-20 0-18 12-30 25-30s25 12 25 30c0 8-4 15-10 20v20c12-7 20-20 20-35 0-25-15-40-40-40z" fill="#409EFF"/><path d="M38 35v30l12-6v-18l-12-6z" fill="#fff"/></svg>
        <p>登录您的心灵视频账号</p>
      </div>
      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef" label-position="top">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            <a href="javascript:;" class="forgot-link">忘记密码?</a>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
      <div>
          <el-button @click="showLogin = false" style="width: 45%">取消</el-button>
          <el-button type="primary" :loading="loginLoading" @click="handleLogin" style="width: 45%">登录</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 视频播放弹窗 -->
    <el-dialog :title="currentVideo ? currentVideo.title : '视频播放'" :model-value="showVideoPlayer" @update:model-value="showVideoPlayer = $event" width="800px" custom-class="video-dialog" top="5vh">
      <div class="video-player" v-if="currentVideo">
        <div class="video-player-cover">
          <img :src="currentVideo.thumbnail || currentVideo.cover" alt="视频" @error="handleImageError" />
          <div class="player-overlay">
            <button class="play-btn-large">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            </button>
          </div>
        </div>
        <div class="video-player-info">
          <div class="player-info-main">
            <h3>{{ currentVideo.title }}</h3>
            <p class="player-desc" v-if="currentVideo.description">{{ currentVideo.description }}</p>
          </div>
          <div class="player-meta">
            <span>{{ currentVideo.author }}</span>
            <span>{{ currentVideo.views }} 观看</span>
            <span>{{ currentVideo.date }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 回到顶部 -->
    <transition name="fade-up">
      <button class="back-to-top" v-show="isScrolled" @click="scrollToTop">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="18 15 12 9 6 15"/></svg>
      </button>
    </transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useUserStore } from '@/store/user'

defineOptions({ name: 'Website' })

const router = useRouter()
const userStore = useUserStore()

const mobileMenuOpen = ref(false)
const showLogin = ref(false)
const showVideoPlayer = ref(false)
const currentVideo = ref(null)
const selectedCategory = ref(null)
const activeFilter = ref('latest')
const isScrolled = ref(false)
const heroAnimated = ref(false)
const loginLoading = ref(false)
let scrollObserver = null
let animationTimer = null

const animatedStats = reactive({ videos: '0', creators: '0', visits: '0' })

const loginForm = reactive({ username: '', password: '', remember: false })

const loginRules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }, { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }, { min: 5, max: 20, message: '密码长度在 5 到 20 个字符', trigger: 'blur' }]
})

const featuredVideo = {
  title: '大自然的声音 - 沉浸式冥想体验',
  description: '跟随自然的节奏，感受内心的平静。',
  cover: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=serene%20nature%20landscape%20with%20forest%20and%20morning%20mist%2C%20peaceful%20meditation%20scene&image_size=landscape_16_9',
  author: '心灵工作室', views: '128K', date: '3天前', duration: '32:00', category: 'meditation'
}

const categories = [
  { id: 'meditation', name: '冥想放松', count: '12K', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'sleep', name: '睡眠助眠', count: '8K', color: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  { id: 'focus', name: '专注学习', count: '15K', color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { id: 'white_noise', name: '白噪音', count: '6K', color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { id: 'art', name: '艺术创作', count: '9K', color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { id: 'music', name: '音乐欣赏', count: '18K', color: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)' }
]

const filterTabs = [
  { id: 'latest', name: '最新' }, { id: 'popular', name: '最热门' }, { id: 'trending', name: '趋势' }, { id: 'featured', name: '精选' }
]

const videos = ref([
  { id: 1, title: '深度睡眠音乐 - 雨声与海浪', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=rain%20falling%20on%20ocean%20waves%2C%20peaceful%20night%20scene&image_size=landscape_4_3', duration: '45:00', author: '睡眠专家', views: '89K', date: '2天前', category: 'sleep', tag: 'latest', featured: true },
  { id: 2, title: '森林冥想 - 清晨鸟鸣', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sunrise%20in%20tropical%20forest%20with%20birds%2C%20peaceful%20nature&image_size=landscape_4_3', duration: '30:00', author: '自然之声', views: '67K', date: '5天前', category: 'meditation', tag: 'trending', featured: false },
  { id: 3, title: '专注学习白噪音', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=minimalist%20study%20desk%20with%20books%2C%20warm%20lighting&image_size=landscape_4_3', duration: '60:00', author: '学习助手', views: '156K', date: '1周前', category: 'focus', tag: 'popular', featured: true },
  { id: 4, title: 'ASMR 轻柔耳语', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=soft%20asmr%20scene%20with%20gentle%20lighting%2C%20cozy%20atmosphere&image_size=landscape_4_3', duration: '25:00', author: 'ASMR 频道', views: '45K', date: '3天前', category: 'white_noise', tag: 'latest', featured: false },
  { id: 5, title: '古典音乐冥想', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=classical%20piano%20with%20elegant%20interior%2C%20soft%20lighting&image_size=landscape_4_3', duration: '50:00', author: '古典音乐', views: '78K', date: '6天前', category: 'music', tag: 'trending', featured: true },
  { id: 6, title: '篝火与风声', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20campfire%20at%20night%2C%20warm%20flames%2C%20starry%20sky&image_size=landscape_4_3', duration: '40:00', author: '户外之声', views: '92K', date: '4天前', category: 'white_noise', tag: 'popular', featured: false },
  { id: 7, title: '瑜伽背景音乐', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20studio%20with%20plants%2C%20peaceful%20environment&image_size=landscape_4_3', duration: '35:00', author: '瑜伽天地', views: '54K', date: '1周前', category: 'meditation', tag: 'latest', featured: false },
  { id: 8, title: '咖啡馆背景音', thumbnail: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cozy%20coffee%20shop%20interior%2C%20warm%20atmosphere&image_size=landscape_4_3', duration: '55:00', author: '城市之声', views: '112K', date: '8天前', category: 'art', tag: 'popular', featured: true }
])

const imageFallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDgwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjRjBGMEY1Ii8+CjxwYXRoIGQ9Ik0zNzAgMTgwSDQzMEEyMCAyMCAwIDAgMSA0NTAgMjAwVjI1MEEyMCAyMCAwIDAgMSA0MzAgMjcwSDM3MEEyMCAyMCAwIDAgMSAzNTAgMjUwVjIwMEEyMCAyMCAwIDAgMSAzNzAgMTgwWiIgZmlsbD0iI0QwRDBENCIvPgo8cGF0aCBkPSJNMzg1IDIxMEw0MTUgMjM1TDM4NSAyNjAiIGZpbGw9IiNBMEEwQTIiLz4KPHRleHQgeD0iNDAwIiB5PSIzMTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiNBMEExQTIiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0Ij7lm77niYfliqDovb3lpLHotKU8L3RleHQ+Cjwvc3ZnPg=='

const loginFormRef = ref(null)

const filteredVideos = computed(() => {
  let result = [...videos.value]
  if (selectedCategory.value) {
    result = result.filter(v => v.category === selectedCategory.value.id)
  }
  switch (activeFilter.value) {
    case 'popular':
      result.sort((a, b) => parseViews(b.views) - parseViews(a.views))
      break
    case 'trending':
      result = result.filter(v => v.tag === 'trending' || v.tag === 'popular')
      break
    case 'featured':
      result = result.filter(v => v.featured)
      break
  }
  return result
})

function parseViews(str) {
  if (!str) return 0
  const num = parseFloat(str)
  if (str.includes('K')) return num * 1000
  if (str.includes('M')) return num * 1000000
  return num
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) {
    const offset = 80
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleScroll() {
  isScrolled.value = window.scrollY > 50
}

function handleImageError(e) {
  e.target.src = imageFallback
}

function handleHeroError(e) {
  e.target.style.display = 'none'
}

function selectCategory(category) {
  if (selectedCategory.value && selectedCategory.value.id === category.id) {
    selectedCategory.value = null
  } else {
    selectedCategory.value = category
  }
  activeFilter.value = 'latest'
  setTimeout(() => scrollTo('videos'), 0)
}

function openVideo(video) {
  currentVideo.value = video
  showVideoPlayer.value = true
}

function handleLogin() {
  loginFormRef.value.validate(valid => {
    if (valid) {
      loginLoading.value = true
      userStore.login({
        username: loginForm.username,
        password: loginForm.password,
        code: '',
        uuid: ''
      }).then(() => {
        ElMessage.success('登录成功')
        showLogin.value = false
        router.push({ path: '/index' })
      }).catch(err => {
        ElMessage.error(err.msg || '登录失败，请检查用户名和密码')
      }).finally(() => {
        loginLoading.value = false
      })
    }
  })
}

function animateCountUp() {
  const targets = { videos: 500, creators: 50, visits: 10 }
  const suffixes = { videos: 'K+', creators: 'K+', visits: 'M+' }
  const duration = 2000
  const steps = 60
  const interval = duration / steps
  let step = 0
  animationTimer = setInterval(() => {
    step++
    const progress = step / steps
    const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
    animatedStats.videos = Math.floor(targets.videos * eased) + suffixes.videos
    animatedStats.creators = Math.floor(targets.creators * eased) + suffixes.creators
    animatedStats.visits = Math.floor(targets.visits * eased) + suffixes.visits
    if (step >= steps) {
      clearInterval(animationTimer)
      animationTimer = null
      animatedStats.videos = targets.videos + suffixes.videos
      animatedStats.creators = targets.creators + suffixes.creators
      animatedStats.visits = targets.visits + suffixes.visits
    }
  }, interval)
}

function setupScrollAnimations() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
      el.classList.add('animated')
    })
    return
  }
  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated')
        scrollObserver.unobserve(entry.target)
      }
    })
  }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' })

  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    scrollObserver.observe(el)
  })

  setTimeout(() => {
    heroAnimated.value = true
    animateCountUp()
  }, 300)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
  setTimeout(() => {
    setupScrollAnimations()
  }, 0)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  if (scrollObserver) {
    scrollObserver.disconnect()
  }
  if (animationTimer) {
    clearInterval(animationTimer)
    animationTimer = null
  }
})
</script>

<style scoped lang="scss">
$primary: #409EFF;
$primary-dark: #337ecc;
$primary-light: #ecf5ff;
$accent: #667eea;
$accent-purple: #764ba2;
$text-primary: #1a1a2e;
$text-secondary: #4a4a68;
$text-muted: #909399;
$bg-light: #f8f9fe;
$bg-white: #ffffff;
$border-color: #e8e8ef;
$max-width: 1200px;
$header-height: 72px;

.website-container {
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  color: $text-primary;
  overflow-x: hidden;
}
.section-container { max-width: $max-width; margin: 0 auto; padding: 0 24px; }
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 24px;
  border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: none; white-space: nowrap;
  &-primary { background: $primary; color: #fff; box-shadow: 0 2px 8px rgba(64,158,255,0.3);
    &:hover { background: $primary-dark; box-shadow: 0 4px 16px rgba(64,158,255,0.4); transform: translateY(-1px); }
  }
  &-outline { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.4);
    &:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.7); }
    &.btn-dark { color: $primary; border-color: $primary;
      &:hover { background: $primary; color: #fff; }
    }
  }
  &-white { background: #fff; color: $accent; box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
  }
  &-ghost { background: transparent; color: #fff; border: 1.5px solid rgba(255,255,255,0.5);
    &:hover { background: rgba(255,255,255,0.15); border-color: #fff; }
  }
  &-large { padding: 14px 36px; font-size: 16px; border-radius: 10px; }
  &-block { width: 100%; }
  .btn-icon { width: 18px; height: 18px; }
}
.site-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000; background: transparent;
  transition: all 0.4s cubic-bezier(0.4,0,0.2,1); padding: 0 40px;
  &.scrolled { background: rgba(10,10,30,0.92); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); box-shadow: 0 1px 20px rgba(0,0,0,0.15); }
  .header-content { display: flex; align-items: center; justify-content: space-between; height: $header-height; }
  .logo { display: flex; align-items: center; gap: 12px; cursor: pointer;
    .logo-icon { width: 36px; height: 36px; color: $primary; }
    .logo-text { font-size: 20px; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
  }
  .main-nav { display: flex; gap: 36px;
    .nav-link { color: rgba(255,255,255,0.8); text-decoration: none; font-size: 15px; font-weight: 500; transition: all 0.3s; position: relative; padding: 4px 0;
      &::after { content: ''; position: absolute; bottom: -2px; left: 0; width: 0; height: 2px; background: $primary; transition: width 0.3s; border-radius: 1px; }
      &:hover { color: #fff; &::after { width: 100%; } }
    }
  }
  .header-actions { display: flex; align-items: center; gap: 12px; }
  .mobile-menu-btn { display: none; flex-direction: column; justify-content: center; gap: 5px; background: none; border: none; cursor: pointer; width: 32px; height: 32px; padding: 4px; transition: all 0.3s;
    span { display: block; width: 24px; height: 2px; background: #fff; border-radius: 2px; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); transform-origin: center; }
    &.active { span:nth-child(1) { transform: rotate(45deg) translate(5px,5px); } span:nth-child(2) { opacity: 0; transform: scaleX(0); } span:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); } }
  }
  .mobile-nav { display: none; padding: 16px 24px 24px; background: rgba(10,10,30,0.98); border-top: 1px solid rgba(255,255,255,0.08);
    .nav-link { display: block; color: rgba(255,255,255,0.8); text-decoration: none; font-size: 16px; font-weight: 500; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,0.06); transition: color 0.3s; &:hover { color: $primary; } }
    .mobile-nav-actions { margin-top: 16px; }
  }
  @media (max-width: 768px) { padding: 0 20px; .main-nav { display: none; } .mobile-menu-btn { display: flex; } .mobile-nav { display: block; } .header-actions .btn { display: none; } }
}
.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease; max-height: 400px; overflow: hidden; }
.slide-down-enter, .slide-down-leave-to { max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; }
.hero-section {
  position: relative; min-height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;
  color: #fff; text-align: center; overflow: hidden; padding: 120px 24px 80px;
  .hero-bg { position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 0;
    img { width: 100%; height: 100%; object-fit: cover; animation: heroBgZoom 25s ease-in-out infinite alternate; }
  }
  .hero-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(135deg, rgba(26,26,46,0.85) 0%, rgba(102,126,234,0.4) 50%, rgba(118,75,162,0.5) 100%), linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%); z-index: 1; }
  .hero-content { position: relative; z-index: 2; max-width: 800px; }
  .hero-title { font-size: 56px; font-weight: 800; margin-bottom: 20px; line-height: 1.2; background: linear-gradient(135deg,#fff 0%,#c8d6ff 40%,$primary 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; animation: heroTitleGlow 4s ease-in-out infinite alternate; }
  .hero-subtitle { font-size: 20px; color: rgba(255,255,255,0.85); margin-bottom: 48px; font-weight: 300; letter-spacing: 0.5px; line-height: 1.6; }
  .hero-actions { display: flex; gap: 20px; justify-content: center; }
  .hero-stats { position: relative; z-index: 2; display: flex; justify-content: center; align-items: center; gap: 48px; margin-top: 80px; padding: 24px 48px; background: rgba(255,255,255,0.06); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; }
  .stat { text-align: center;
    .stat-number { display: block; font-size: 36px; font-weight: 700; background: linear-gradient(135deg,$primary 0%,$accent 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 6px; }
    .stat-label { font-size: 14px; color: rgba(255,255,255,0.65); font-weight: 500; }
  }
  .stat-divider { width: 1px; height: 40px; background: rgba(255,255,255,0.15); }
  @media (max-width: 768px) { min-height: auto; padding: 140px 20px 60px; .hero-title { font-size: 34px; } .hero-subtitle { font-size: 16px; margin-bottom: 36px; } .hero-actions { flex-direction: column; align-items: center; gap: 12px; .btn { width: 100%; max-width: 280px; } } .hero-stats { flex-direction: column; gap: 20px; padding: 24px; margin-top: 48px; .stat-divider { width: 40px; height: 1px; } .stat-number { font-size: 28px; } } }
}
@keyframes heroBgZoom { 0% { transform: scale(1); } 100% { transform: scale(1.08); } }
@keyframes heroTitleGlow { from { filter: drop-shadow(0 0 8px rgba(64,158,255,0.3)); } to { filter: drop-shadow(0 0 20px rgba(102,126,234,0.5)); } }
.animate-on-scroll { opacity: 0; transform: translateY(30px); transition: opacity 0.7s cubic-bezier(0.4,0,0.2,1), transform 0.7s cubic-bezier(0.4,0,0.2,1); &.animated { opacity: 1; transform: translateY(0); } }
.section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px;
  &.center { justify-content: center; text-align: center; }
  .section-title { font-size: 32px; font-weight: 700; color: $text-primary; margin-bottom: 8px; line-height: 1.3; }
  .section-subtitle { font-size: 16px; color: $text-muted; margin-top: 4px; }
  .view-all { display: inline-flex; align-items: center; gap: 6px; color: $primary; text-decoration: none; font-size: 14px; font-weight: 600; transition: gap 0.3s; &:hover { gap: 10px; } .icon-arrow { width: 16px; height: 16px; } }
}
.featured-section { padding: 100px 0; background: $bg-light;
  .featured-video { display: grid; grid-template-columns: 1.5fr 1fr; background: $bg-white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06); cursor: pointer; transition: all 0.4s cubic-bezier(0.4,0,0.2,1);
    &:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.12); transform: translateY(-4px); }
  }
  .video-cover { position: relative; min-height: 380px; overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; }
    .featured-video:hover & img { transform: scale(1.05); }
    .play-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.25); opacity: 0; transition: opacity 0.4s; }
    .featured-video:hover & .play-overlay { opacity: 1; }
    .play-btn { width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,0.95); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: $primary; box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: transform 0.3s;
      &:hover { transform: scale(1.1); } svg { width: 28px; height: 28px; margin-left: 4px; }
    }
    .featured-badge { position: absolute; top: 20px; left: 20px; background: linear-gradient(135deg,$accent,$accent-purple); color: #fff; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 20px; letter-spacing: 0.5px; }
  }
  .video-info { padding: 40px; display: flex; flex-direction: column; justify-content: center;
    .video-title { font-size: 24px; font-weight: 700; color: $text-primary; margin-bottom: 16px; line-height: 1.4; }
    .video-description { font-size: 15px; color: $text-secondary; line-height: 1.7; margin-bottom: 24px; }
    .video-meta { display: flex; flex-direction: column; gap: 12px; font-size: 14px; color: $text-muted;
      > span { display: flex; align-items: center; gap: 8px; }
      .author { color: $primary; font-weight: 500; }
      .meta-icon { width: 16px; height: 16px; flex-shrink: 0; }
    }
  }
  @media (max-width: 768px) { padding: 60px 0; .featured-video { grid-template-columns: 1fr; } .video-cover { min-height: 220px; } .video-info { padding: 24px; .video-title { font-size: 20px; } } }
}
.categories-section { padding: 100px 0; background: $bg-white;
  .categories-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 20px; }
  .category-card { background: $bg-light; border-radius: 16px; padding: 28px 16px; text-align: center; cursor: pointer; transition: all 0.35s cubic-bezier(0.4,0,0.2,1); border: 2px solid transparent;
    &:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
    &.selected { border-color: $primary; background: $primary-light; box-shadow: 0 4px 16px rgba(64,158,255,0.2); }
    .category-icon { width: 56px; height: 56px; border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; color: #fff; svg { width: 28px; height: 28px; } }
    .category-name { font-size: 16px; font-weight: 600; color: $text-primary; margin-bottom: 6px; }
    .category-count { font-size: 13px; color: $text-muted; }
  }
  .btn-reset-filter { display: inline-flex; align-items: center; gap: 6px; background: none; border: 1px solid $border-color; padding: 8px 16px; border-radius: 8px; font-size: 13px; color: $text-muted; cursor: pointer; transition: all 0.3s;
    &:hover { color: #f56c6c; border-color: #f56c6c; } .icon-small { width: 14px; height: 14px; }
  }
  @media (max-width: 1024px) { .categories-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 768px) { padding: 60px 0; .categories-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } .category-card { padding: 20px 12px; } }
}
.videos-section { padding: 100px 0; background: $bg-light;
  .filter-tabs { display: flex; gap: 8px; }
  .filter-tab { padding: 8px 18px; border-radius: 20px; background: $bg-white; border: 1px solid $border-color; cursor: pointer; font-size: 13px; font-weight: 500; color: $text-secondary; transition: all 0.3s;
    &.active { background: $primary; color: #fff; border-color: $primary; box-shadow: 0 2px 8px rgba(64,158,255,0.3); }
    &:hover:not(.active) { border-color: $primary; color: $primary; background: $primary-light; }
  }
  .videos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-top: 32px; }
  .video-card { background: $bg-white; border-radius: 14px; overflow: hidden; cursor: pointer; transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
    &:hover { transform: translateY(-6px); box-shadow: 0 12px 32px rgba(0,0,0,0.1); }
    .video-thumbnail { position: relative; height: 165px; overflow: hidden;
      img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
      .video-card:hover & img { transform: scale(1.08); }
      .duration-badge { position: absolute; bottom: 10px; right: 10px; background: rgba(0,0,0,0.75); color: #fff; font-size: 12px; font-weight: 500; padding: 3px 8px; border-radius: 6px; backdrop-filter: blur(4px); }
      .hover-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3); opacity: 0; transition: opacity 0.35s; }
      .video-card:hover & .hover-overlay { opacity: 1; }
      .play-btn-small { width: 48px; height: 48px; border-radius: 50%; background: rgba(255,255,255,0.95); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: $primary; box-shadow: 0 2px 12px rgba(0,0,0,0.2); transition: transform 0.3s;
        &:hover { transform: scale(1.1); } svg { width: 20px; height: 20px; margin-left: 3px; }
      }
    }
    .video-content { padding: 18px;
      .video-card-title { font-size: 15px; font-weight: 600; color: $text-primary; margin-bottom: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .video-card-author { font-size: 13px; color: $primary; font-weight: 500; margin-bottom: 8px; }
      .video-card-meta { display: flex; gap: 12px; font-size: 12px; color: $text-muted; }
    }
  }
  .empty-state { text-align: center; padding: 60px 20px; margin-top: 32px;
    .empty-icon { width: 64px; height: 64px; color: $text-muted; margin-bottom: 16px; }
    p { font-size: 16px; color: $text-muted; margin-bottom: 20px; }
  }
  .load-more { text-align: center; margin-top: 48px; }
  @media (max-width: 1024px) { .videos-grid { grid-template-columns: repeat(3, 1fr); } }
  @media (max-width: 768px) { padding: 60px 0; .videos-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; } .filter-tabs { flex-wrap: wrap; } .section-header { flex-direction: column; align-items: flex-start; gap: 16px; } }
  @media (max-width: 480px) { .videos-grid { grid-template-columns: 1fr; } }
}
.video-card-enter-active { transition: all 0.4s ease; }
.video-card-leave-active { transition: all 0.3s ease; position: absolute; }
.video-card-enter { opacity: 0; transform: translateY(20px); }
.video-card-leave-to { opacity: 0; transform: scale(0.9); }
.video-card-move { transition: transform 0.4s ease; }
.about-section { padding: 100px 0; background: $bg-white;
  .about-content { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
  .about-text { .section-title { font-size: 32px; margin-bottom: 16px; } .about-description { font-size: 16px; color: $text-secondary; line-height: 1.8; margin-bottom: 40px; } .features-list { display: flex; flex-direction: column; gap: 28px; } .feature-item { display: flex; gap: 20px; align-items: flex-start;
    .feature-icon { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg,$primary-light,#d9ecff); display: flex; align-items: center; justify-content: center; color: $primary; flex-shrink: 0; svg { width: 24px; height: 24px; } }
    .feature-info { h4 { font-size: 18px; font-weight: 600; color: $text-primary; margin-bottom: 6px; } p { font-size: 14px; color: $text-muted; line-height: 1.6; } }
  } }
  .about-image-wrapper { position: relative;
    img { width: 100%; border-radius: 16px; box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
    .about-image-decoration { position: absolute; top: -20px; right: -20px; width: 100%; height: 100%; border: 2px solid $primary; border-radius: 16px; opacity: 0.2; z-index: -1; }
  }
  @media (max-width: 768px) { padding: 60px 0; .about-content { grid-template-columns: 1fr; gap: 40px; } .about-image-decoration { display: none; } }
}
.pricing-section { padding: 100px 0; background: $bg-light;
  .section-header { text-align: center; margin-bottom: 60px; .section-title { font-size: 36px; } .section-subtitle { margin-top: 12px; } }
  .pricing-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; max-width: 1080px; margin: 0 auto; }
  .pricing-card { background: $bg-white; border-radius: 16px; padding: 40px 32px; text-align: center; position: relative; border: 2px solid transparent; transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
    &:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }
    &.popular { border-color: $primary; box-shadow: 0 8px 32px rgba(64,158,255,0.15);
      .popular-badge { position: absolute; top: -14px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg,$primary,$accent); color: #fff; font-size: 12px; font-weight: 600; padding: 6px 20px; border-radius: 20px; white-space: nowrap; }
    }
    .pricing-header { margin-bottom: 32px; h3 { font-size: 22px; font-weight: 700; color: $text-primary; margin-bottom: 6px; } .pricing-desc { font-size: 14px; color: $text-muted; margin-bottom: 20px; } .price { display: flex; align-items: baseline; justify-content: center; .currency { font-size: 22px; color: $text-primary; font-weight: 600; margin-right: 2px; } .amount { font-size: 52px; font-weight: 800; color: $text-primary; line-height: 1; } .period { font-size: 16px; color: $text-muted; margin-left: 4px; } } }
    .pricing-features { list-style: none; padding: 0; margin-bottom: 32px; text-align: left;
      li { display: flex; align-items: center; gap: 10px; padding: 11px 0; font-size: 14px; color: $text-secondary; border-bottom: 1px solid #f5f5f5; &:last-child { border-bottom: none; } .check-icon { width: 16px; height: 16px; color: $primary; flex-shrink: 0; } }
    }
    .btn { width: 100%; }
  }
  @media (max-width: 1024px) { .pricing-grid { grid-template-columns: 1fr; max-width: 420px; } }
  @media (max-width: 768px) { padding: 60px 0; }
}
.cta-section { background: linear-gradient(135deg,$accent 0%,$accent-purple 50%,$primary 100%); padding: 100px 0; text-align: center; color: #fff; position: relative; overflow: hidden;
  &::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 30px 30px; animation: ctaBgMove 20s linear infinite; }
  .cta-content { position: relative; z-index: 1; h2 { font-size: 40px; font-weight: 800; margin-bottom: 16px; } p { font-size: 18px; opacity: 0.9; margin-bottom: 40px; } .cta-actions { display: flex; gap: 16px; justify-content: center; } }
  @media (max-width: 768px) { padding: 60px 0; .cta-content { h2 { font-size: 28px; } p { font-size: 16px; } .cta-actions { flex-direction: column; align-items: center; .btn { width: 100%; max-width: 280px; } } } }
}
@keyframes ctaBgMove { 0% { transform: translate(0,0); } 100% { transform: translate(30px,30px); } }
.site-footer { background: #0a0a1e; color: rgba(255,255,255,0.7); padding: 72px 0 0;
  .footer-content { display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr 1fr; gap: 40px; padding-bottom: 48px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .footer-brand { .logo { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; .logo-icon { width: 32px; height: 32px; color: $primary; } .logo-text { font-size: 18px; font-weight: 700; color: #fff; } } .footer-desc { font-size: 14px; line-height: 1.7; color: rgba(255,255,255,0.5); } }
  .footer-section { h4 { font-size: 14px; font-weight: 600; color: #fff; margin-bottom: 20px; letter-spacing: 0.5px; } ul { list-style: none; padding: 0; li { margin-bottom: 12px; a { color: rgba(255,255,255,0.5); text-decoration: none; font-size: 14px; transition: all 0.3s; &:hover { color: $primary; } } } } }
  .footer-bottom { display: flex; justify-content: space-between; align-items: center; padding: 28px 0; p { font-size: 13px; color: rgba(255,255,255,0.4); } .social-links { display: flex; gap: 12px; .social-link { width: 38px; height: 38px; border-radius: 10px; background: rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.5); text-decoration: none; transition: all 0.3s; svg { width: 18px; height: 18px; } &:hover { background: $primary; color: #fff; transform: translateY(-2px); } } } }
  @media (max-width: 768px) { padding: 48px 0 0; .footer-content { grid-template-columns: 1fr 1fr; gap: 32px; } .footer-brand { grid-column: 1 / -1; } .footer-bottom { flex-direction: column; gap: 16px; text-align: center; } }
}
.login-dialog-header { text-align: center; margin-bottom: 24px; .login-logo { width: 48px; height: 48px; margin-bottom: 12px; } p { font-size: 14px; color: $text-muted; } }
.login-options { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.forgot-link { font-size: 14px; color: $primary; text-decoration: none; &:hover { text-decoration: underline; } }
.video-player { .video-player-cover { position: relative; border-radius: 12px; overflow: hidden;
    img { width: 100%; display: block; border-radius: 12px; }
    .player-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.4); transition: background 0.3s; &:hover { background: rgba(0,0,0,0.5); } }
    .play-btn-large { width: 72px; height: 72px; border-radius: 50%; background: rgba(255,255,255,0.95); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; color: $primary; box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: transform 0.3s;
      &:hover { transform: scale(1.1); } svg { width: 30px; height: 30px; margin-left: 4px; }
    }
  }
  .video-player-info { margin-top: 20px; display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;
    .player-info-main { flex: 1; h3 { font-size: 18px; font-weight: 700; color: $text-primary; margin-bottom: 8px; } .player-desc { font-size: 14px; color: $text-secondary; line-height: 1.6; } }
    .player-meta { display: flex; gap: 16px; font-size: 13px; color: $text-muted; white-space: nowrap; flex-shrink: 0; padding-top: 4px; }
  }
}
.back-to-top { position: fixed; bottom: 40px; right: 40px; width: 48px; height: 48px; border-radius: 14px; background: $primary; color: #fff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(64,158,255,0.4); z-index: 999; transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  svg { width: 22px; height: 22px; }
  &:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(64,158,255,0.5); }
  @media (max-width: 768px) { bottom: 24px; right: 24px; width: 42px; height: 42px; border-radius: 12px; }
}
.fade-up-enter-active { transition: all 0.3s ease; }
.fade-up-leave-active { transition: all 0.2s ease; }
.fade-up-enter, .fade-up-leave-to { opacity: 0; transform: translateY(20px); }
</style>
