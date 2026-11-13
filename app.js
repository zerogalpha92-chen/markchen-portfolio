/* 游戏主美作品集 · 交互脚本 */
(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 配色主题（紫金终版 / 浅蓝 / 电影感） ---------- */
  const THEMES = ["vegas", "sky", "cine"];
  const DEFAULT_THEME = "vegas";
  const THEME_KEY = "cm-theme-v2";
  const THEME_COLOR = { sky: "#ffffff", vegas: "#1c0743", cine: "#0a0908" };
  const themeBtn = $("#themeToggle");
  const applyTheme = t => {
    document.documentElement.dataset.theme = t;
    localStorage.setItem(THEME_KEY, t);
    themeBtn?.setAttribute("aria-pressed", String(t !== DEFAULT_THEME));
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLOR[t] || THEME_COLOR[DEFAULT_THEME]);
  };
  themeBtn?.addEventListener("click", () => {
    const cur = THEMES.indexOf(document.documentElement.dataset.theme);
    applyTheme(THEMES[(cur + 1 + THEMES.length) % THEMES.length] || DEFAULT_THEME);
  });
  applyTheme(document.documentElement.dataset.theme || DEFAULT_THEME);

  /* ---------- Hero Banner 轮播 ---------- */
  const SLIDES = [
    { k: "GAME ART DIRECTOR · PORTFOLIO 2026",
      t: "游戏主美 —— 用视觉讲好每一个世界。<br>角色 · 场景 · UI 图标 · 宣传主视觉的全案美术统筹。" },
    { k: "UNDERWATER · 海底世界",
      t: "从水面波光到深海剪影，层层递进的空间氛围控制。" },
    { k: "SUMMER CARNIVAL · 夏日狂欢",
      t: "霓虹、烟花与人潮——高饱和派对的色彩统合与光效控制。" },
  ];
  const slides = $$(".slide");
  const dots = $$(".hero__dots button");
  const kickerEl = $("#heroKicker");
  const tagEl = $("#heroTagline");
  let cur = 0, timer = null;

  function go(i) {
    const prev = cur;
    cur = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
      s.classList.toggle("is-active", n === cur);
      // 新激活的一条从头播放
      const v = s.querySelector("video");
      if (v && n === cur) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
    });
    // 上一条要等交叉淡入跑完再暂停，否则淡出期间画面会冻住
    if (prev !== cur) {
      const pv = slides[prev] && slides[prev].querySelector("video");
      if (pv) setTimeout(() => {
        if (!slides[prev].classList.contains("is-active")) pv.pause();
      }, reduceMotion ? 0 : 1150);
    }
    dots.forEach((d, n) => d.classList.toggle("is-active", n === cur));
    // 文案淡出 → 换内容 → 淡入（与画面交叉淡入同步）
    kickerEl.classList.add("is-fading");
    tagEl.classList.add("is-fading");
    setTimeout(() => {
      kickerEl.textContent = SLIDES[cur].k;
      tagEl.innerHTML = SLIDES[cur].t;
      kickerEl.classList.remove("is-fading");
      tagEl.classList.remove("is-fading");
    }, reduceMotion ? 0 : 320);
  }
  function play() {
    clearInterval(timer);
    // 固定 6 秒自动切换，任何交互都不会暂停
    timer = setInterval(() => go(cur + 1), 6000);
  }
  // 首屏之后再预热其余视频，保证切换时已经缓冲好、过渡不卡
  addEventListener("load", () => {
    setTimeout(() => {
      slides.forEach(s => {
        const v = s.querySelector("video");
        if (v && v.preload !== "auto") {
          v.preload = "auto";
          v.load();
        }
      });
    }, reduceMotion ? 0 : 1200);
  });

  // 无悬停/点击暂停逻辑：鼠标进出、点击、切页都不打断自动轮播
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // 后台只暂停视频解码省资源，轮播计时照常运行
      slides.forEach(s => s.querySelector("video")?.pause());
    } else {
      slides[cur]?.querySelector("video")?.play().catch(() => {});
    }
  });
  play();

  /* ============================================================
     封面配置（想换封面只改这里）
     ------------------------------------------------------------
     用法一 —— 换成图集里的某张：填序号，从 0 开始
         "ui-lobby": 2        ← 用该作品图集第 3 张当封面
     用法二 —— 用自己单独准备的封面图：填图片路径
         "ui-lobby": "assets/works/ui-lobby/my-cover.jpg"
     不写的作品 → 自动用图集第一张当封面
     封面一律按 3:2 自动裁切填满卡片
     ============================================================ */
  const COVERS = {
    /* —— 按截图选区从原图裁切的定制封面（assets/covers/）—— */
    "ui-lobby":     "assets/covers/ui-lobby.jpg",
    "ui-royal":     "assets/covers/ui-royal.jpg",
    "ui-bingo":     "assets/covers/ui-bingo.jpg",
    "ui-bankheist": "assets/covers/ui-bankheist.jpg",
    "ui-pirates":   "assets/covers/ui-pirates.jpg",
    "ui-tigers":    "assets/covers/ui-tigers.jpg",
    "ui-gold":      "assets/covers/ui-gold.jpg",
    "ui-diamond":   "assets/covers/ui-diamond.jpg",
    "ui-savanna":   "assets/covers/ui-savanna.jpg",
    "ui-icefire":   "assets/covers/ui-icefire.jpg",
    "ui-charge":    "assets/covers/ui-charge.jpg",
    "ui-urban":     "assets/covers/ui-urban.jpg",
    "ui-legendary": "assets/covers/ui-legendary.jpg",
    "ui-wheelpay":  "assets/covers/ui-wheelpay.jpg",
    "ui-wulin":     "assets/covers/ui-wulin.jpg",
    "ui-zorro":     "assets/covers/ui-zorro.jpg",
    "ui-qipai":     "assets/covers/ui-qipai.jpg",
    "ui-cardspec":  "assets/covers/ui-cardspec.jpg",
    "ui-megawheel": "assets/covers/ui-megawheel.jpg",
    "ui-luckycards":   "assets/covers/ui-luckycards.jpg",
    "ui-cashfortune":  "assets/covers/ui-cashfortune.jpg",
    "ui-midas":        "assets/covers/ui-midas.jpg",
    "ui-slots-lobby":  "assets/covers/ui-slots-lobby.jpg",
    "ui-pachinko":     "assets/covers/ui-pachinko.jpg",
    "logo-mockup":  "assets/covers/logo-mockup.jpg",
    "popup-win":    "assets/covers/popup-win.jpg",
    "popup-zeus":   "assets/covers/popup-zeus.jpg",
    "logo-showcase":"assets/covers/logo-showcase.jpg",
    "char-royal":   "assets/covers/char-royal.jpg",
    /* —— 图集内选张：填序号（0 起）—— */
    "popup-lobby":  1,
    "kv-dynasty":   0,
    "kv-casino":    0,
  };

  /* ---------- 作品数据（灯箱详情） ---------- */
  const WORKS =
[
  {
    "t": "皇家城堡 · 角色设计",
    "en": "ROYAL CASTLE · CHARACTER DESIGN",
    "slug": "char-royal",
    "tag": "角色设计",
    "d": "皇家城堡题材角色设计：国王、皇后、王子、公主、骑士、弓箭手、大臣、贵妇 8 个角色，每个角色 5 阶形态进化（平民 → 传说），配色、材质与装饰逐级升级，统一厚涂卡通风与顶部受光。",
    "r": "角色设计",
    "gallery": [
      "assets/works/char-royal/char-royal-1.jpg",
      "assets/works/char-royal/char-royal-2.jpg",
      "assets/works/char-royal/char-royal-3.jpg",
      "assets/works/char-royal/char-royal-4.jpg",
      "assets/works/char-royal/char-royal-5.jpg",
      "assets/works/char-royal/char-royal-6.jpg",
      "assets/works/char-royal/char-royal-7.jpg",
      "assets/works/char-royal/char-royal-8.jpg"
    ]
  },
  {
    "t": "Slots 大厅 · 全面屏界面",
    "en": "CASINO LOBBY · FULLSCREEN UI",
    "slug": "ui-lobby",
    "tag": "UI·HUD 图标设计",
    "d": "全面屏机型的 Slots 游戏大厅：顶部资源栏与活动入口、中部游戏推荐与登录奖励、底部功能导航，另含转盘活动弹层，覆盖大厅核心链路。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-lobby/ui-lobby-1.jpg"
    ]
  },
  {
    "t": "Royal Family · 收集图鉴",
    "en": "ROYAL FAMILY · COLLECTION UI",
    "slug": "ui-royal",
    "tag": "UI·HUD 图标设计",
    "d": "角色收集图鉴与 Final Prize 结算流程：卡牌收集进度、奖励展示与领取动效分区明确，信息密度高仍保持清晰层级。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-royal/ui-royal-1.jpg"
    ]
  },
  {
    "t": "Disco Bingo · 加载与主界面",
    "en": "DISCO BINGO · LOADING UI",
    "slug": "ui-bingo",
    "tag": "UI·HUD 图标设计",
    "d": "Bingo 玩法的加载页与主界面：霓虹舞厅主题，LOGO 字体、进度条与界面框架统一视觉语言。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-bingo/ui-bingo-1.jpg"
    ]
  },
  {
    "t": "Mega Wheel · 转盘主界面",
    "en": "MEGA WHEEL · VEGAS SPIN",
    "slug": "ui-megawheel",
    "tag": "UI·HUD 图标设计",
    "d": "大转盘玩法主界面与奖池展示：高饱和紫金配色强化中奖氛围，Jackpot 与倍奖区视觉突出。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-megawheel/ui-megawheel-1.jpg"
    ]
  },
  {
    "t": "Bank Heist · 主题界面",
    "en": "BANK HEIST · SLOT UI",
    "slug": "ui-bankheist",
    "tag": "UI·HUD 图标设计",
    "d": "银行劫案主题 Slot 界面：警察与劫匪角色、Wild 与奖池弹层，剧情感贯穿界面层级。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-bankheist/ui-bankheist-1.jpg"
    ]
  },
  {
    "t": "Pirates Fortune · 主题界面",
    "en": "PIRATES FORTUNE · SLOT UI",
    "slug": "ui-pirates",
    "tag": "UI·HUD 图标设计",
    "d": "海盗寻宝主题：女海盗主角立绘、宝箱 Wild 与航海场景，暖金色调统一全套界面。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-pirates/ui-pirates-1.jpg"
    ]
  },
  {
    "t": "Wild Tigers · 主题界面",
    "en": "WILD TIGERS · SLOT UI",
    "slug": "ui-tigers",
    "tag": "UI·HUD 图标设计",
    "d": "丛林猛虎主题 Slot：虎头主视觉与丛林色系，图标与背景统一质感。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-tigers/ui-tigers-1.jpg"
    ]
  },
  {
    "t": "Leprechaun's Gold · 主题界面",
    "en": "LEPRECHAUN'S GOLD · SLOT UI",
    "slug": "ui-gold",
    "tag": "UI·HUD 图标设计",
    "d": "爱尔兰矮精灵主题：绿金配色与彩虹奖励路径，幸运主题贯穿。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-gold/ui-gold-1.jpg"
    ]
  },
  {
    "t": "Diamond Lounge · 主题界面",
    "en": "DIAMOND LOUNGE · SLOT UI",
    "slug": "ui-diamond",
    "tag": "UI·HUD 图标设计",
    "d": "钻石会所主题：红幕布与爵士乐队角色，复古 Vegas 氛围。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-diamond/ui-diamond-1.jpg"
    ]
  },
  {
    "t": "Savanna Cash · 主题界面",
    "en": "SAVANNA CASH · SLOT UI",
    "slug": "ui-savanna",
    "tag": "UI·HUD 图标设计",
    "d": "非洲草原主题：狮子主视觉与日落色系，动物元素贯穿图标系统。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-savanna/ui-savanna-1.jpg"
    ]
  },
  {
    "t": "Ice and Fire · 角色界面",
    "en": "ICE AND FIRE · CHARACTERS",
    "slug": "ui-icefire",
    "tag": "UI·HUD 图标设计",
    "d": "冰火双系角色展示界面：寒冰与烈焰两套色系对比，角色立绘与技能图标配套。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-icefire/ui-icefire-1.jpg"
    ]
  },
  {
    "t": "Zorro · 主题界面",
    "en": "ZORRO · SLOT UI",
    "slug": "ui-zorro",
    "tag": "UI·HUD 图标设计",
    "d": "佐罗主题界面：黑金配色与侠客剪影，经典IP的现代化演绎。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-zorro/ui-zorro-1.jpg"
    ]
  },
  {
    "t": "Legendary Mark · 免费游戏",
    "en": "LEGENDARY MARK · FREE GAMES",
    "slug": "ui-legendary",
    "tag": "UI·HUD 图标设计",
    "d": "5 场免费游戏玩法界面与奖励弹层：免费次数、倍率与特殊符号的规则可视化。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-legendary/ui-legendary-1.jpg"
    ]
  },
  {
    "t": "Charge Blue or Red · 功能界面",
    "en": "CHARGE BLUE OR RED · FEATURE",
    "slug": "ui-charge",
    "tag": "UI·HUD 图标设计",
    "d": "红蓝阵营选择玩法界面：双色 Wild、道具图标系统与机关机制展示。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-charge/ui-charge-1.jpg"
    ]
  },
  {
    "t": "Urban Prediction · 功能界面",
    "en": "URBAN PREDICTION · FEATURE",
    "slug": "ui-urban",
    "tag": "UI·HUD 图标设计",
    "d": "都市街头主题功能界面与 Feature Win 展示：霓虹夜色与都市角色。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-urban/ui-urban-1.jpg"
    ]
  },
  {
    "t": "转盘付费 · 弹窗界面",
    "en": "SPIN OFFER · POPUP UI",
    "slug": "ui-wheelpay",
    "tag": "UI·HUD 图标设计",
    "d": "转盘付费活动弹窗：奖品环、按钮层级与付费点引导，转化路径清晰。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-wheelpay/ui-wheelpay-1.jpg"
    ]
  },
  {
    "t": "卡牌游戏 · 登录与规范",
    "en": "CARD GAME · LOGIN & GUIDE",
    "slug": "ui-cardspec",
    "tag": "UI·HUD 图标设计",
    "d": "棋牌手游的多端界面展示：Loading 加载、Set 牌桌与 Tips 引导三段式排布，笔电与双机呈现登录、创建房间与牌桌布局，保证多端视觉统一。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-cardspec/ui-cardspec-1.jpg"
    ]
  },
  {
    "t": "武林豪侠传 · 登录界面",
    "en": "WULIN LEGEND · LOGIN",
    "slug": "ui-wulin",
    "tag": "UI·HUD 图标设计",
    "d": "武侠题材手游登录界面：水墨底纹与金色 LOGO，中国风的界面演绎。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-wulin/ui-wulin-1.jpg"
    ],
    "y": "2019"
  },
  {
    "t": "棋牌游戏 · 大厅界面",
    "en": "CHESS & CARD · LOBBY",
    "slug": "ui-qipai",
    "tag": "UI·HUD 图标设计",
    "d": "棋牌游戏大厅与练习场界面：牌桌布局、玩家座位与道具栏，移动端适配。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-qipai/ui-qipai-1.jpg",
      "assets/works/ui-qipai/ui-qipai-2.jpg"
    ],
    "y": "2020"
  },
  {
    "t": "Lucky Cards · 收集玩法界面",
    "en": "LUCKY CARDS · COLLECTION UI",
    "slug": "ui-luckycards",
    "tag": "UI·HUD 图标设计",
    "d": "Lucky Cards 收集玩法展示：卡册翻页式收集界面、卡牌图鉴与 TRAP TO SPIN 转盘，串起收集—兑换—抽奖的完整动线。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-luckycards/ui-luckycards-1.jpg"
    ]
  },
  {
    "t": "Cash Fortune · 界面设计展示",
    "en": "CASH FORTUNE · UI SHOWCASE",
    "slug": "ui-cashfortune",
    "tag": "UI·HUD 图标设计",
    "d": "Cash Fortune 界面展示：Loading、线上奖励与线索玩法三段式排布，笔电与手机双端呈现资源栏、奖励进度与活动入口。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-cashfortune/ui-cashfortune-1.jpg"
    ]
  },
  {
    "t": "Midas Touch · 界面设计展示",
    "en": "MIDAS TOUCH · UI SHOWCASE",
    "slug": "ui-midas",
    "tag": "UI·HUD 图标设计",
    "d": "Midas Touch 界面展示：主游戏、Preloader、Pick a Chest 与 Golden Pick 特色玩法，金色主题贯穿图标与界面。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-midas/ui-midas-1.jpg"
    ]
  },
  {
    "t": "Slots 大厅 · 加载与奖励动线",
    "en": "SLOTS LOBBY · LOADING & REWARDS",
    "slug": "ui-slots-lobby",
    "tag": "UI·HUD 图标设计",
    "d": "Slots 产品大厅界面：Loading、线上奖励与线索提示三段动线，多端呈现大厅资源栏、活动入口与奖励领取。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-slots-lobby/ui-slots-lobby-1.jpg"
    ]
  },
  {
    "t": "Pachinball Bonus · 弹珠玩法",
    "en": "PACHINBALL BONUS · SLOTS GAME",
    "slug": "ui-pachinko",
    "tag": "UI·HUD 图标设计",
    "d": "Pachinball Bonus 弹珠玩法：欢迎页、弹珠台、Deluxe 礼包与中奖播报，7.12 亿金币结算与 COLLECT 流程完整呈现。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/ui-pachinko/ui-pachinko-1.jpg"
    ]
  },
  {
    "t": "宙斯 Rising · 活动弹窗",
    "en": "ZEUS RISING · EVENT POPUPS",
    "slug": "popup-zeus",
    "tag": "UI·HUD 图标设计",
    "d": "希腊神话主题活动弹窗系列：Fever Link 多奖池、滚轴奖励与付费引导，同一弹窗系统的多状态输出。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/popup-zeus/popup-zeus-1.jpg",
      "assets/works/popup-zeus/popup-zeus-2.jpg",
      "assets/works/popup-zeus/popup-zeus-3.jpg",
      "assets/works/popup-zeus/popup-zeus-4.jpg",
      "assets/works/popup-zeus/popup-zeus-5.jpg"
    ]
  },
  {
    "t": "黑帮猪 · 活动弹窗",
    "en": "GANGSTA PIGS · EVENT POPUPS",
    "slug": "popup-piggy",
    "tag": "UI·HUD 图标设计",
    "d": "卡通黑帮猪主题活动弹窗：PICK 奖励、免费游戏与收集玩法，横屏与竖屏机型双适配。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/popup-piggy/popup-piggy-1.jpg",
      "assets/works/popup-piggy/popup-piggy-2.jpg",
      "assets/works/popup-piggy/popup-piggy-3.jpg",
      "assets/works/popup-piggy/popup-piggy-4.jpg",
      "assets/works/popup-piggy/popup-piggy-5.jpg",
      "assets/works/popup-piggy/popup-piggy-6.jpg"
    ]
  },
  {
    "t": "阿拉丁 · 功能弹窗",
    "en": "ALADIN · FEATURE POPUPS",
    "slug": "popup-aladin",
    "tag": "UI·HUD 图标设计",
    "d": "阿拉丁神灯主题功能弹窗：道具升级与奖励强化流程，阶段感明确。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/popup-aladin/popup-aladin-1.jpg",
      "assets/works/popup-aladin/popup-aladin-2.jpg",
      "assets/works/popup-aladin/popup-aladin-3.jpg"
    ]
  },
  {
    "t": "神秘奖励 · 功能弹窗",
    "en": "MYSTERY OFFER · POPUPS",
    "slug": "popup-mystery",
    "tag": "UI·HUD 图标设计",
    "d": "神秘奖励系列弹窗：BUY MORE + FREE 奖励组合与付费点设计，按钮层级引导转化。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/popup-mystery/popup-mystery-1.jpg",
      "assets/works/popup-mystery/popup-mystery-2.jpg",
      "assets/works/popup-mystery/popup-mystery-3.jpg",
      "assets/works/popup-mystery/popup-mystery-4.jpg"
    ]
  },
  {
    "t": "转盘与中奖弹窗 · 合集",
    "en": "SPIN & WIN · POPUP COLLECTION",
    "slug": "popup-win",
    "tag": "UI·HUD 图标设计",
    "d": "转盘抽奖活动（Press to Spin）、Congrats 免费游戏奖励与 GRAND JACKPOT 大奖播报三类弹窗合集，覆盖从活动入口到中奖反馈的完整链路。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/popup-win/popup-win-1.jpg",
      "assets/works/popup-win/popup-win-2.jpg",
      "assets/works/popup-win/popup-win-3.jpg",
      "assets/works/popup-win/popup-win-4.jpg",
      "assets/works/popup-win/popup-win-5.jpg",
      "assets/works/popup-win/popup-win-6.jpg",
      "assets/works/popup-win/popup-win-7.jpg",
      "assets/works/popup-win/popup-win-8.jpg",
      "assets/works/popup-win/popup-win-9.jpg",
      "assets/works/popup-win/popup-win-10.jpg",
      "assets/works/popup-win/popup-win-11.jpg",
      "assets/works/popup-win/popup-win-12.jpg",
      "assets/works/popup-win/popup-win-13.jpg"
    ]
  },
  {
    "t": "游戏大厅 · 活动弹窗",
    "en": "LOBBY EVENTS · POPUPS",
    "slug": "popup-lobby",
    "tag": "UI·HUD 图标设计",
    "d": "Slot 大厅活动弹窗与入口：限时活动、礼包与主题轮换，保持大厅信息层级不混乱。",
    "r": "UI 设计",
    "gallery": [
      "assets/works/popup-lobby/popup-lobby-1.jpg",
      "assets/works/popup-lobby/popup-lobby-2.jpg",
      "assets/works/popup-lobby/popup-lobby-3.jpg",
      "assets/works/popup-lobby/popup-lobby-4.jpg",
      "assets/works/popup-lobby/popup-lobby-5.jpg"
    ]
  },
  {
    "t": "君临天下 · 宣传 Banner",
    "en": "DIVINITY WAR · PROMO BANNERS",
    "slug": "kv-dynasty",
    "tag": "宣传主视觉",
    "d": "三国题材手游《君临天下》系列宣传 Banner：武将立绘与实机画面组合的投放物料，魏蜀吴多阵营系列化输出。",
    "r": "宣传视觉设计",
    "gallery": [
      "assets/works/kv-dynasty/kv-dynasty-1.jpg"
    ]
  },
  {
    "t": "Casino 促销活动 Banner",
    "en": "CASINO PROMO · EVENT BANNERS",
    "slug": "kv-casino",
    "tag": "宣传主视觉",
    "d": "Slots 产品促销活动图系列：圣诞、嘉年华等节日主题活动，优惠信息与奖池的视觉引导和层级设计。",
    "r": "宣传视觉设计",
    "gallery": [
      "assets/works/kv-casino/kv-casino-1.jpg"
    ]
  },
  {
    "t": "Major Suitcase · 活动弹窗物料",
    "en": "MAJOR SUITCASE · EVENT POPUP",
    "slug": "kv-major-suitcase",
    "tag": "宣传主视觉",
    "d": "限时开箱活动弹窗：左侧宝箱主视觉配 FAST 标签，右侧 1 亿金币奖励与 2 小时倒计时，底部四档宝箱状态条驱动付费开箱。",
    "r": "宣传视觉设计",
    "gallery": [
      "assets/works/kv-major-suitcase/kv-major-suitcase-1.jpg"
    ]
  },
  {
    "t": "Explosive Deal · 投放素材",
    "en": "EXPLOSIVE DEAL · AD CREATIVE",
    "slug": "kv-explosive-deal",
    "tag": "宣传主视觉",
    "d": "爆炸式促销投放图：保险柜与炸药机关做主视觉，12.8 亿金币与 900% MORE 作为视觉焦点，Pay on Web 开关与 $2.99 按钮构成完整转化路径。",
    "r": "宣传视觉设计",
    "gallery": [
      "assets/works/kv-explosive-deal/kv-explosive-deal-1.jpg"
    ]
  },
  {
    "t": "Special Offer · 投放素材",
    "en": "SPECIAL OFFER · AD CREATIVE",
    "slug": "kv-special-offer",
    "tag": "宣传主视觉",
    "d": "Special Offer 促销图：金币堆与保险柜场景，34.5 亿金币为主体，400% MORE COINS 徽章与 USD 29.99 按钮强化比价与转化。",
    "r": "宣传视觉设计",
    "gallery": [
      "assets/works/kv-special-offer/kv-special-offer-1.jpg"
    ]
  },
  {
    "t": "Slots 多端展示 · Cash Party",
    "en": "SLOTS MULTI-DEVICE · CASH PARTY",
    "slug": "kv-mockup-slots",
    "tag": "宣传主视觉",
    "d": "Cash Party 多端界面展示：四台 iMac 依次排开，呈现 Daily Wheel、Pachinball Rewards 与主游戏界面，用于产品宣发物料。",
    "r": "宣传视觉设计",
    "gallery": [
      "assets/works/kv-mockup-slots/kv-mockup-slots-1.jpg"
    ]
  },
  {
    "t": "Slots 多端展示 · Midas Touch",
    "en": "SLOTS MULTI-DEVICE · MIDAS TOUCH",
    "slug": "kv-mockup-midas",
    "tag": "宣传主视觉",
    "d": "Midas Touch 多端界面展示：四台 iMac 呈现主游戏、Wild 倍奖与 2000 万总下注界面，统一的霓虹紫金质感。",
    "r": "宣传视觉设计",
    "gallery": [
      "assets/works/kv-mockup-midas/kv-mockup-midas-1.jpg"
    ]
  },
  {
    "t": "游戏 LOGO 字体设计",
    "en": "GAME LOGO · LETTERING",
    "slug": "logo-sheets",
    "tag": "LOGO 设计",
    "d": "休闲博弈类游戏 LOGO 字体设计合集：每个 LOGO 对应不同题材与气质，金属、糖果、霓虹等多种质感，共 90 余款。",
    "r": "LOGO 设计",
    "gallery": [
      "assets/works/logo-sheets/logo-sheets-1.jpg",
      "assets/works/logo-sheets/logo-sheets-2.jpg"
    ]
  },
  {
    "t": "游戏 LOGO · 应用展示",
    "en": "GAME LOGOS · IN-APP",
    "slug": "logo-mockup",
    "tag": "LOGO 设计",
    "d": "LOGO 在真实机型中的应用展示：Wonder Snow Princess 等多款游戏的 Loading 界面与开屏。",
    "r": "LOGO 设计",
    "gallery": [
      "assets/works/logo-mockup/logo-mockup-1.jpg",
      "assets/works/logo-mockup/logo-mockup-2.jpg",
      "assets/works/logo-mockup/logo-mockup-3.jpg",
      "assets/works/logo-mockup/logo-mockup-4.jpg",
      "assets/works/logo-mockup/logo-mockup-5.jpg",
      "assets/works/logo-mockup/logo-mockup-6.jpg"
    ]
  },
  {
    "t": "9500 · The Beasts 标识",
    "en": "9500 · THE BEASTS",
    "slug": "logo-9500",
    "tag": "LOGO 设计",
    "d": "暗黑风格的数字标识设计：几何兽形与文字组合，硬朗的金属质感。",
    "r": "LOGO 设计",
    "gallery": [
      "assets/works/logo-9500/logo-9500-1.jpg"
    ]
  },
  {
    "t": "游戏 LOGO · 精选展示",
    "en": "GAME LOGO · SELECTED SHOWCASE",
    "slug": "logo-showcase",
    "tag": "LOGO 设计",
    "d": "精选游戏 LOGO 展示墙，共 63 款：轮盘、美洲币、钻石、金币、福尔摩斯、银行劫案、JACKPOT、武士、龙、维京、丛林、糖果等题材，覆盖金属、糖果、霓虹、复古多种质感。点击可放大细看单个 LOGO。",
    "r": "LOGO 设计",
    "gallery": [
      "assets/works/logo-showcase/logo-showcase-1.jpg"
    ]
  }
];

  /* ---------- 顶部导航状态 ---------- */
  const topbar = $("#topbar");
  const onScroll = () => topbar.classList.toggle("is-scrolled", scrollY > 24);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 移动端菜单 ---------- */
  const burger = $("#burger"), nav = $("#nav");
  const closeNav = () => { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  $$("#nav a").forEach(a => a.addEventListener("click", closeNav));

  /* ---------- 入场动画 ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    // 能力条
    const bar = e.target.matches(".bar") ? e.target : e.target.querySelector?.(".bar");
    if (bar) bar.querySelector("i").style.width = bar.dataset.level + "%";
    // 数字滚动
    $$("[data-count]", e.target.matches("[data-count]") ? e.target.parentElement : e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: .15, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal, .bar").forEach(el => io.observe(el));

  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = "1";
    const end = +el.dataset.count, dur = 1400, t0 = performance.now();
    if (reduceMotion) { el.textContent = end; return; }
    const tick = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- 图片渐显 ---------- */
  $$("img").forEach(img => {
    if (img.complete && img.naturalWidth) img.classList.add("is-loaded");
    else img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
  });

  /* ---------- 作品封面：COVERS 可配序号(图集第几张)或图片路径，不配则用图集第一张 ---------- */
  const coverOf = (slug, w) => {
    const c = COVERS[slug];
    if (typeof c === "number") return w.gallery[c] || w.gallery[0];
    if (typeof c === "string") return c;
    return w.gallery[0];
  };
  /* 灯箱底部缩略图条用小图（assets/works/thumbs/…）：
     主图现在保留原图分辨率（单张可达数 MB），拿它当缩略图会把整组大图都拖下来 */
  const thumbOf = p => p.replace("/works/", "/works/thumbs/");
  const cards = $$(".card");
  cards.forEach(card => {
    const w = WORKS[+card.dataset.idx];
    const img = card.querySelector("img");
    const coverSrc = coverOf(w.slug, w);
    if (img.getAttribute("src") !== coverSrc) img.src = coverSrc;
  });

  /* ---------- 作品筛选 ---------- */
  $$(".chip").forEach(chip => chip.addEventListener("click", () => {
    $$(".chip").forEach(c => { c.classList.toggle("is-active", c === chip); c.setAttribute("aria-selected", String(c === chip)); });
    const f = chip.dataset.filter;
    cards.forEach(card => {
      const show = f === "all" || card.dataset.cat === f;
      card.classList.toggle("is-hidden", !show);
      card.classList.toggle("is-filtered", !show);
      if (show) { card.classList.remove("is-in"); void card.offsetWidth; card.classList.add("is-in"); }
    });
  }));

  function setFact(sel, label, val) {
    const el = $(sel);
    el.textContent = val ? `${label} ${val}` : "";
    el.hidden = !val;
  }
  /* ---------- 灯箱（站酷式：封面 + 图集） ---------- */
  const lb = $("#lightbox"), lbImg = $("#lbImg"), lbThumbs = $("#lbThumbs"), lbCount = $("#lbCount");
  let lbCur = 0, gCur = 0;   // lbCur 当前作品 · gCur 作品内图集序号
  let visibleIdx = [];

  const refreshVisible = () => visibleIdx = cards.filter(c => !c.classList.contains("is-hidden")).map(c => +c.dataset.idx);

  function renderThumbs(w) {
    lbThumbs.innerHTML = "";
    const coverSrc = coverOf(w.slug, w);
    w.gallery.forEach((src, n) => {
      const b = document.createElement("button");
      const isCover = src === coverSrc;
      b.innerHTML = `<img src="${thumbOf(src)}" alt="${w.t} 图 ${n+1}" loading="lazy">`
        + (isCover ? '<i class="lightbox__thumbcov">封面</i>' : "");
      if (isCover) b.classList.add("is-cover");
      b.addEventListener("click", () => showImg(n));
      lbThumbs.appendChild(b);
    });
  }
  function showImg(n) {
    if (zoomed) setZoom(false);   // 换图时退出放大态
    const w = WORKS[lbCur];
    gCur = (n + w.gallery.length) % w.gallery.length;
    stage.classList.add("is-loading");     // 高清主图单张可达数 MB，给个加载动效
    lbImg.src = w.gallery[gCur];
    lbImg.alt = `${w.t} · 图 ${gCur + 1}`;
    if (lbMark) lbMark.classList.remove("is-on");   // 换图先收起水印，避免停在旧位置
    lbCount.textContent = `${gCur + 1} / ${w.gallery.length}`;
    [...lbThumbs.children].forEach((b, i) => {
      b.classList.toggle("is-active", i === gCur);
      if (i === gCur) b.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    });
  }
  function show(i) {
    lbCur = (i + WORKS.length) % WORKS.length;
    const w = WORKS[lbCur];
    $("#lbTag").textContent = w.tag;
    $("#lbTitle").textContent = w.t;
    $("#lbEn").textContent = w.en;
    $("#lbDesc").textContent = w.d;
    setFact("#lbYear", "年份", w.y);
    setFact("#lbRole", "职责", w.r);
    setFact("#lbTool", "工具", w.tool);
    renderThumbs(w);
    // 灯箱默认停在封面那一张（封面是单独图片则从第 1 张开始）
    const c = COVERS[w.slug];
    showImg(typeof c === "number" ? c : 0);
  }
  function open(i) {
    refreshVisible();
    show(i);
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    $(".lightbox__close").focus();
    requestAnimationFrame(() => { if (!lb.hidden) applyStageMode(); });   // 布局稳定后再贴一次尺寸
  }
  function close() {
    if (zoomed) setZoom(false);
    lb.hidden = true;
    document.body.style.overflow = "";
  }

  /* ---------- 点击放大预览（点击处放大 · 上下滑动查看 · Ctrl+滚轮/双指缩放） ---------- */
  const stage = $(".lightbox__stage"), lbHint = $("#lbHint"), lbShield = $(".lightbox__shield");
  const lbMark = $("#lbMark"), lbBox = $(".lightbox__box");
  let zoomed = false, zScale = 1, zX = 0, zY = 0;

  /* 署名水印定位：贴到「图片实际显示矩形」的右上角。
     object-fit:contain 会在两侧留黑边，水印若跟着舞台走就会落在黑边上，
     别人一裁就把水印去掉了 —— 所以要按 natural 尺寸反算显示矩形。
     竖长图（is-tall）是上下滚动的，直接贴舞台右上角，保证始终可见。 */
  function placeMark() {
    if (!lbMark) return;
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const nw = lbImg.naturalWidth, nh = lbImg.naturalHeight;
    if (!nw || !nh || !sw) return;
    let dw = sw, dh = sh, dx = 0, dy = 0;
    if (!stage.classList.contains("is-tall")) {
      const r = Math.min(sw / nw, sh / nh);
      dw = nw * r; dh = nh * r;
      dx = (sw - dw) / 2; dy = (sh - dh) / 2;
    }
    /* 可见区 = 图片区域 ∩ 灯箱盒子 ∩ 视口：
       竖长图在窄屏下整张撑高、由页面级滚动查看，只按舞台底边定位会跑到几千像素外；
       而窄屏下舞台又会溢出灯箱盒子，落到盒子外就被背景遮罩盖掉了。 */
    const stR = stage.getBoundingClientRect();
    const boxR = lbBox ? lbBox.getBoundingClientRect() : stR;
    const visTop = Math.max(0, boxR.top - stR.top, -stR.top);
    const visBot = Math.min(sh, Math.max(visTop, boxR.bottom - stR.top),
                            Math.max(visTop, window.innerHeight - stR.top));
    const yBot = Math.min(dy + dh, Math.max(visBot, 1));
    /* left/top 与 right/bottom 只能留一组：同时存在盒子会被拉伸，
       而这里要读 offsetHeight 定位，会形成「越拉越高」的反馈回路。 */
    lbMark.style.right = "auto";
    lbMark.style.bottom = "auto";
    const mh = lbMark.offsetHeight || 24;
    lbMark.style.left = Math.max(0, dx + 10) + "px";
    lbMark.style.top = Math.max(0, Math.max(dy + 6, yBot - mh - 10)) + "px";
    lbMark.style.maxWidth = Math.max(80, dw - 20) + "px";
    lbMark.classList.add("is-on");
  }
  /* 只在图片 load 那一刻算一次是不够的：字体/折行会让灯箱盒子随后变高变矮，
     水印就会停在旧位置（窄屏尤其明显）。补几次延迟复算 + 监听盒子尺寸变化。 */
  let markT1 = 0, markT2 = 0;
  function scheduleMark() {
    clearTimeout(markT1); clearTimeout(markT2);
    placeMark();
    requestAnimationFrame(placeMark);
    markT1 = setTimeout(placeMark, 80);
    markT2 = setTimeout(placeMark, 700);
  }
  if (window.ResizeObserver && lbBox) {
    new ResizeObserver(() => { if (!lb.hidden) requestAnimationFrame(placeMark); }).observe(lbBox);
  }

  const applyZoom = () => { lbImg.style.transform = `translate3d(${zX}px,${zY}px,0) scale(${zScale})`; };
  const centerOf = el => { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; };

  /* 竖长图态：按宽铺满 + 上下滚动（1:5 的长图在 3:2 舞台里 contain 会缩成细条） */
  const lbScroll = $(".lightbox__scroll");
  const wideLayout = () => matchMedia("(min-width: 861px)").matches;  // 窄屏走可滚动的纵向版式
  const dropStageSize = () => { stage.style.width = ""; stage.style.height = ""; stage.style.aspectRatio = ""; };

  /* 舞台贴合图片真实比例：让作品本身吃满展示区
     （固定 3:2 舞台放近方形图，contain 后左右会留大片空档） */
  function fitStage(nw, nh, tall) {
    if (zoomed || tall || !wideLayout()) { dropStageSize(); return; }
    const viewer = stage.parentElement;
    const availW = viewer.clientWidth;
    const availH = viewer.clientHeight - lbThumbs.offsetHeight;   // 展示区可用高 = 视口高 − 缩略图条
    if (availW <= 0 || availH <= 0) return;
    const ar = nw / nh;
    let w = availW;
    if (w / ar > availH) w = availH * ar;                          // 高度不够时改按高度贴合
    stage.style.width = Math.round(w) + "px";
    stage.style.height = "";
    stage.style.aspectRatio = nw + " / " + nh;
  }
  function applyStageMode() {
    const nw = lbImg.naturalWidth, nh = lbImg.naturalHeight;
    const tall = !zoomed && nw > 0 && nh / nw >= 1.25;   // 比 4:5 更竖即启用
    stage.classList.toggle("is-tall", tall);
    if (tall) lbScroll.scrollTop = 0;
    if (nw > 0) fitStage(nw, nh, tall);
    lbHint.textContent = zoomed
      ? "上下拖动 / 滚轮滑动查看 · Ctrl+滚轮 缩放 · 点击还原"
      : (tall ? "上下滚动查看长图 · 点击放大" : "点击图片放大查看");
    scheduleMark();
  }
  lbImg.addEventListener("load", applyStageMode);
  lbImg.addEventListener("load", () => stage.classList.remove("is-loading"));
  lbImg.addEventListener("error", () => stage.classList.remove("is-loading"));
  addEventListener("resize", () => { if (!lb.hidden) applyStageMode(); });
  /* 滚动时跟随重算：scroll 不冒泡，用捕获阶段一次覆盖灯箱内滚与页面级滚动 */
  let markRaf = 0;
  document.addEventListener("scroll", () => {
    if (lb.hidden || !lbMark || markRaf) return;
    markRaf = requestAnimationFrame(() => { markRaf = 0; placeMark(); });
  }, { capture: true, passive: true });

  /* 图片按 object-fit:contain 在舞台中的实际显示尺寸 */
  function baseSize() {
    const sw = stage.clientWidth, sh = stage.clientHeight;
    const nw = lbImg.naturalWidth || sw, nh = lbImg.naturalHeight || sh;
    const r = Math.min(sw / nw, sh / nh);
    return { w: nw * r, h: nh * r, sw, sh };
  }
  /* 平移边界：图片不脱离舞台；没超出舞台的方向自动归位 */
  function clampPan() {
    const b = baseSize();
    const ox = Math.max(0, (b.w * zScale - b.sw) / 2);
    const oy = Math.max(0, (b.h * zScale - b.sh) / 2);
    zX = Math.min(ox, Math.max(-ox, zX));
    zY = Math.min(oy, Math.max(-oy, zY));
  }
  /* 以某点为锚缩放：锚点下的画面保持不动（Pc 为相对舞台中心的坐标） */
  function zoomAt(Pc, next) {
    const ns = Math.min(5, Math.max(1, next));
    const k = ns / zScale;
    zX = Pc.x - k * (Pc.x - zX);
    zY = Pc.y - k * (Pc.y - zY);
    zScale = ns;
    clampPan(); applyZoom();
  }
  function setZoom(on, scale) {
    zoomed = on;
    lb.classList.toggle("is-zoom", on);
    lbImg.style.transformOrigin = "50% 50%";     // 改用平移实现「以点击处为中心放大」
    zScale = on ? (scale || 1.7) : 1; zX = 0; zY = 0;
    if (on) {                       // 先放开贴合尺寸，再强制重排，才能拿到放大态的真实舞台尺寸
      dropStageSize(); void stage.offsetWidth; clampPan(); applyZoom();
    }
    else lbImg.style.transform = "";
    applyStageMode();
  }
  // 点击放大（以点击处为中心）/ 点击还原
  lbShield.addEventListener("click", e => {
    if (dragMoved) return;
    if (zoomed) { setZoom(false); return; }
    const c0 = centerOf(stage);                    // 放大前的舞台中心
    const u = { x: e.clientX - c0.x, y: e.clientY - c0.y };   // 点击点在画面中的位置
    setZoom(true);
    const c1 = centerOf(stage);                    // 放大后的舞台中心
    zX = e.clientX - c1.x - zScale * u.x;          // 让点击处那块画面留在原地
    zY = e.clientY - c1.y - zScale * u.y;
    clampPan(); applyZoom();
  });
  // 滚轮：竖长图态 → 滚动长图；放大态 → 默认上下/左右平移，按住 Ctrl(⌘) 才缩放
  let wheelT;
  stage.addEventListener("wheel", e => {
    if (!zoomed) {
      if (stage.classList.contains("is-tall")) { e.preventDefault(); lbScroll.scrollTop += e.deltaY; }
      return;
    }
    e.preventDefault();
    const c = centerOf(stage);
    if (e.ctrlKey || e.metaKey) {
      zoomAt({ x: e.clientX - c.x, y: e.clientY - c.y }, zScale * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
      return;
    }
    stage.classList.add("is-panning");
    zX -= e.deltaX; zY -= e.deltaY;
    clampPan(); applyZoom();
    clearTimeout(wheelT);
    wheelT = setTimeout(() => stage.classList.remove("is-panning"), 120);
  }, { passive: false });

  // 拖拽平移（鼠标拖动 / 触摸单指滑动 / 双指捏合缩放）
  const pts = new Map();
  let dragging = false, dragMoved = false, tallDrag = false, lx = 0, ly = 0, pinchBase = 0;
  const distOf = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
  const midOf = () => { const [a, b] = [...pts.values()]; return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }; };
  const startPan = (x, y) => {
    dragging = true; lx = x; ly = y;
    lbShield.classList.add("is-dragging"); stage.classList.add("is-panning");
  };
  const stopPan = () => {
    dragging = false; pinchBase = 0;
    lbShield.classList.remove("is-dragging"); stage.classList.remove("is-panning");
  };
  lbShield.addEventListener("pointerdown", e => {
    if (!zoomed) {
      // 竖长图态：单指/按住拖动 = 滚动长图
      if (stage.classList.contains("is-tall")) {
        tallDrag = true; dragMoved = false; lx = e.clientX; ly = e.clientY;
        lbShield.setPointerCapture?.(e.pointerId);
      }
      return;
    }
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    lbShield.setPointerCapture?.(e.pointerId);
    if (pts.size === 2) {                     // 双指：转入捏合缩放
      dragMoved = true; dragging = false;
      lbShield.classList.remove("is-dragging");
      pinchBase = distOf();
      return;
    }
    if (pts.size > 2) return;
    dragMoved = false;
    startPan(e.clientX, e.clientY);
  });
  lbShield.addEventListener("pointermove", e => {
    if (tallDrag) {
      const dy = e.clientY - ly, dx = e.clientX - lx;
      if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
      lbScroll.scrollTop -= dy; lx = e.clientX; ly = e.clientY;
      return;
    }
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size >= 2) {                      // 捏合缩放
      const d = distOf();
      if (!pinchBase) { pinchBase = d; return; }
      const c = centerOf(stage), m = midOf();
      zoomAt({ x: m.x - c.x, y: m.y - c.y }, zScale * (d / pinchBase));
      pinchBase = d;
      return;
    }
    if (!dragging) return;
    const dx = e.clientX - lx, dy = e.clientY - ly;
    if (Math.abs(dx) + Math.abs(dy) > 3) dragMoved = true;
    zX += dx; zY += dy; lx = e.clientX; ly = e.clientY;
    clampPan(); applyZoom();
  });
  const endDrag = e => {
    if (tallDrag) { tallDrag = false; setTimeout(() => dragMoved = false, 0); return; }
    if (e && e.pointerId !== undefined) pts.delete(e.pointerId);
    if (pts.size >= 2) return;
    pinchBase = 0;
    if (pts.size === 1) {                     // 双指收回到单指：以剩余手指为新起点继续滑动
      const p = [...pts.values()][0];
      dragMoved = true;
      startPan(p.x, p.y);
      return;
    }
    if (!dragging) return;
    stopPan();
    setTimeout(() => dragMoved = false, 0);
  };
  lbShield.addEventListener("pointerup", endDrag);
  lbShield.addEventListener("pointercancel", endDrag);

  cards.forEach(card => card.addEventListener("click", () => open(+card.dataset.idx)));
  $$("[data-close]", lb).forEach(el => el.addEventListener("click", close));
  // 图集内翻页（大图两侧箭头 / 键盘 / 滑动）
  $("[data-gprev]", lb).addEventListener("click", () => showImg(gCur - 1));
  $("[data-gnext]", lb).addEventListener("click", () => showImg(gCur + 1));
  // 作品之间切换（信息面板底部）
  $("[data-wprev]", lb).addEventListener("click", () => show(visibleIdx[(visibleIdx.indexOf(lbCur) - 1 + visibleIdx.length) % visibleIdx.length] ?? lbCur - 1));
  $("[data-wnext]", lb).addEventListener("click", () => show(visibleIdx[(visibleIdx.indexOf(lbCur) + 1) % visibleIdx.length] ?? lbCur + 1));

  addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") { zoomed ? setZoom(false) : close(); return; }
    if (zoomed) return;                                  // 放大态下方向键不翻图
    if (e.key === "ArrowLeft") showImg(gCur - 1);
    if (e.key === "ArrowRight") showImg(gCur + 1);
  });

  // 触摸滑动：翻图集（放大态下用于平移，不翻图）
  let sx = 0;
  lb.addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive: true });
  lb.addEventListener("touchend", e => {
    if (zoomed) return;
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 50) showImg(gCur + (dx > 0 ? -1 : 1));
  }, { passive: true });

  /* ---------- 图片保护：禁止右键另存 / 拖拽保存 / 长按保存 / 快捷键另存 ---------- */
  const hitImg = t => !!(t && t.closest &&
    t.closest("img, video, .card__media, .slide, .lightbox__stage, .lightbox__thumbs"));
  document.addEventListener("contextmenu", e => { if (hitImg(e.target)) e.preventDefault(); });
  document.addEventListener("dragstart", e => { if (hitImg(e.target)) e.preventDefault(); });
  document.addEventListener("selectstart", e => { if (hitImg(e.target)) e.preventDefault(); });
  document.addEventListener("copy", e => { if (hitImg(e.target)) e.preventDefault(); });   // 复制图片到剪贴板
  document.addEventListener("keydown", e => {
    if (e.key === "F12") { e.preventDefault(); return; }        // 开发者工具（可绕过，只提高门槛）
    if (!(e.ctrlKey || e.metaKey)) return;
    const k = e.key.toLowerCase();
    if (k === "s" || k === "u" || k === "p" || (e.shiftKey && ["i", "j", "c"].includes(k))) e.preventDefault();
  });
  /* 静态 <img> 也统一下 draggable（ Firefox 不认 -webkit-user-drag ） */
  document.querySelectorAll("img").forEach(im => { im.draggable = false; });

  /* ---------- 微信号：点击一键复制 ---------- */
  const copyEl = $("[data-copy]");
  if (copyEl) {
    const original = copyEl.textContent;
    /* 复制：https 下走 Clipboard API，file:// 等非安全上下文降级为 execCommand */
    const copyText = v => {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(v);
      return new Promise(res => {
        const ta = document.createElement("textarea");
        ta.value = v; ta.setAttribute("readonly", "");
        ta.style.cssText = "position:fixed;left:-9999px;opacity:0";
        document.body.appendChild(ta); ta.select();
        try { document.execCommand("copy"); } catch { /* 忽略 */ }
        ta.remove(); res();
      });
    };
    copyEl.addEventListener("click", () => {
      copyText(copyEl.dataset.copy).catch(() => {});   // 不阻塞反馈
      copyEl.classList.add("is-copied");
      copyEl.textContent = "WeChat copied ✓";
      clearTimeout(copyEl._t);
      copyEl._t = setTimeout(() => {
        copyEl.classList.remove("is-copied");
        copyEl.textContent = original;
      }, 1600);
    });
  }

  /* ---------- 年份 ---------- */
  $("#year").textContent = new Date().getFullYear();
})();
