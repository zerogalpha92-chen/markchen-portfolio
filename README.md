# 游戏主美作品集网站

双主题单页作品集模板，纯静态（HTML/CSS/JS），零依赖、离线可用（仅标题字体走 Google Fonts，离线时自动回退系统字体）。

- **VEGAS 主题（默认）**：参考 Slotomania 的视觉体系 —— 深紫罗兰夜空 + 霓虹品红 + 金色 + 青绿点缀，绿色渐变发光 CTA 胶囊按钮。
- **CINE 主题**：暗黑电影感 · 暗金。
- 右上角圆形按钮一键切换，选择存入 `localStorage`（键名 `cm-theme-v2`）；想改默认主题，把 `index.html` 中 `<html data-theme="vegas">`、内联脚本的 `"vegas"` 与 `app.js` 的 `DEFAULT_THEME` 一起改即可。

## Hero 动态 Banner

首屏为 3 条视频自动轮播 Banner（6 秒/条，1.1 秒交叉淡入，全程自动、任何交互都不打断）：

1. 视频文件在 `assets/video/`：`hero-summer-1/2/3.mp4`（**1920×824**，无音轨，CRF21 / x264 High / +faststart），同名 `.jpg` 是首帧海报图，慢网下切换不出现空档；
2. 帧顺序与文案在 `app.js` 顶部的 `SLIDES` 数组与 `index.html` 的 `.hero__slides` 中配置，两者顺序需保持一致；
3. 切换时上一条会继续播放到交叉淡入结束才暂停，避免淡出期间画面被冻住；
4. 页面加载后会延迟预热其余视频，保证下一次切换已经缓冲好；
5. 视频亮度由 `styles.css` 的 `.slide video{filter:...}` 统一调节；
6. `prefers-reduced-motion` 下自动停用轮播。

## 本地预览

直接双击 `index.html` 用浏览器打开即可；或在该目录起一个静态服务：

```bash
python -m http.server 8080
# 访问 http://localhost:8080
```

## 如何替换成你自己的内容

### 1. 作品图与封面（构建管线）

作品不是手工塞进 HTML 的，而是由脚本从**素材源目录**批量生成：

```
F:/作品整理/            <- 素材源目录（banner/、UI/、ICON LOGO/、角色/）
        |
        v
tools/build_works.py     <- 读源图 -> 转 JPG（保留原图分辨率）-> 写 assets/works/<slug>/，
        |                   同时生成 thumbs 小图，并重建 app.js 的 WORKS 与 index.html 的卡片/筛选
        v
assets/works/<slug>/<slug>-N.jpg          图集主图（保留原图分辨率，上限 3000 宽 / q90 / 4:4:4）
assets/works/thumbs/<slug>/<slug>-N.jpg   灯箱缩略图条专用小图（360 宽 / q82 / 4:4:4）
assets/covers/<slug>.jpg                  卡片封面（保持素材原始比例，宽 1000~1400 / q88~93 / 4:4:4）
assets/covers/thumbs/                     未使用（封面本身就是小图）
```

> **主图不再压缩到 2000 宽**。2026-10-13 起保留原图分辨率，这样灯箱里点击放大
> 看到的是真正的原图像素；单张可达 1~4MB，所以：
> - 卡片网格一律走 `assets/covers/*.jpg`（约 0.2MB/张），与主图体积无关；
> - 灯箱底部缩略图条走 `assets/works/thumbs/`，用 `app.js` 里的 `thumbOf()` 转换路径；
> - `assets/works/` 全量约 132MB，改动前请先备份。

> **JPEG 必须用 `subsampling=0`（4:4:4），别用 Pillow 默认的 4:2:0。**
> Pillow 存 JPEG 默认 `subsampling=2`，色度平面只剩一半分辨率；而源素材基本都是
> 4:4:4。重编码后实测蓝通道 PSNR 从 43 dB 掉到 34 dB、Cb 掉到 34.7 dB —— 肉眼就是
> 「颜色发闷、彩色描边发糊」。`build_works.py` 里由常量 `SUB = 0` 统一控制。

```bash
python tools/build_works.py          # 重新生成全部作品图 + 卡片 + WORKS
```

**只想改一个作品的画质、不想跑全量重建**（全量会 `rmtree` + 重写 `app.js`/`index.html`）：

```bash
python tools/requant_work.py ui-qipai "UI/乐赢棋牌.jpg" "UI/棋牌练习.jpg"
```

`requant_work.py` 从源图**原样**重新编码（不缩放、不裁剪，构图与尺寸和 `build_works.py`
完全一致），同步重生成 thumbs，并在写入前把旧文件备份到 `_backup/requant/<slug>/`。
参数（`MAIN_Q` / `THUMB_Q` / `SUB`）与 `build_works.py` 保持一致，改一处要同步改两处。
写完后它会**自检输出确实是 4:4:4**，不是就报错退出。

> **注意**：`build_works.py` **不清空** `assets/works/`，而是逐个覆写。
> 早期版本会先 `shutil.rmtree`，但那样既容易被沙箱的批量删除保护拦下（>50 文件
> 需要人工放行），也意味着「脚本中途失败 = 图集被清空」。改成覆写后任何中断都只是
> 留下旧文件；代价是改名/删除过的图会残留 —— 脚本结尾会打印「孤儿文件」清单，
> 由人工确认后手动清理。项目内自备素材（不走源目录的）放在 `assets/works-src/<slug>/`，
> 构建时复制到 `assets/works/`，母版缺失会直接报错退出。

### 2. 封面单独裁切

封面从源图另取一块窗口。**关键规则：封面必须保持素材原始比例，绝不能统一 resize 成 3:2。**

卡片网格是 `aspect-ratio:3/2` + `object-fit:cover` —— `cover` 只**裁切**、不拉伸。
所以封面无论什么比例都安全；反过来，封面一旦被非等比 resize，画面就被拉变形了。

> **踩过的坑（2026-10-14）**：上一轮为了让封面「统一规格」，把所有封面强制输出成
> 1200×800。而素材原始比例并不都是 3:2（`ui-legendary` 2.169、`ui-savanna` 1.898、
> `ui-icefire` 1.698、`ui-royal` 1.751……），结果 21 张封面被非等比拉伸，
> 表现为人物/按钮「被压扁」。**修法见 `tools/recut_covers_fix.py`。**

| 脚本 | 用途 |
|---|---|
| `tools/recut_covers_fix.py` | **当前唯一正确的封面重裁工具**：以最初未变形的封面为构图基准，在多尺度 NCC 定位到高清源图后**等比**裁剪输出（宽 1400，源更窄则保持原宽） |
| `tools/requant_covers.py` | 修「构图本来就对、只是编码烂」的封面（`subsampling` 漏配）：直接拿当前封面当模板去源图定位，裁出**原生像素**那块并输出 4:4:4。两套基准的分工见下 |
| `tools/make_extra_covers.py` | 给「借用图集图当封面」的作品补独立封面（居中裁 3:2，与原 `object-fit:cover` 观感一致） |
| `tools/cut_covers.py` | 早期：按截图的选区在源图里 NCC 定位后裁封面 |
| `tools/cut_covers_user.py` | 早期：按指定的框选区域（slug → 源图 → y 区间）裁封面 |
| `tools/make_char_cover.py` | 角色作品封面（8 个角色抠图 + 统一背景排版） |

**两个重裁工具的分工**（都基于同一套 NCC 定位，别混用）：

- `recut_covers_fix.py` 的基准是 `_backup/covers` 里**未变形的旧封面** —— 面向那批
  被强制拉成 3:2 的封面，靠旧封面把原始比例找回来；
- `requant_covers.py` 的基准是**当前的封面本身** —— 面向那批比例本来就对、构图也对、
  只是编码用了 4:2:0 的封面。基准不同是因为目的不同：前者要纠正比例，后者只需要原像素。

**封面宽度策略：`clamp(原生块宽, 1200, 1400)`。** 下限 1200 不是「凑像素」——
卡片是 607 CSS px，DPR 2 的屏上需要约 1214 个物理像素；源块只有 627 宽的话浏览器照样
要放大，与其让浏览器用双线性插值，不如离线用 LANCZOS 一次插好。上限 1400 则是控制体积。
（`popup-zeus` 的原生块只有 627 宽、`logo-mockup` 1019，就是靠下限拉到 1200 的。）

```bash
python tools/recut_covers_fix.py [slug ...]  # 不传参数就处理全部有源图的封面（21 张）
                                             # 结果先落地到 _recut_tmp/，核对后再 cp 到 assets/covers/
python tools/requant_covers.py [slug ...]    # 同样落 _recut_tmp/，自检门槛 0.90
python tools/make_extra_covers.py            # 补齐 kv-dynasty / kv-casino / popup-lobby / logo-sheets
```

`recut_covers_fix.py` 的自检是「把新封面等比缩回旧封面尺寸后比对 NCC」，门槛 0.90；
不达标就跳过、保留原封面。**注意不要用「把新封面 resize 成旧封面尺寸再比」以外的
方式自检** —— 若两边都做过非等比缩放，那种比较会互相抵消、检测不出变形。

> **封面也要 `subsampling=0`（2026-10-16）**：上一轮只重裁了 21 张封面，
> `ui-qipai.jpg` 是唯一漏网的 —— 它的比例本来就叫 3:2，所以没进重裁名单，
> 于是编码参数还停在 Pillow 默认的 4:2:0，成了全站画质最差的一张封面。
> 重编码时一律显式写 `subsampling=0`。**自检用 `tools/jpeg_subsampling.py`** ——
> `PIL.JpegImagePlugin.get_sampling()` 对 progressive JPEG 会返回 -1，不可信；
> 该脚本直接读 SOF 段的采样因子，最稳：
>
> ```bash
> python tools/jpeg_subsampling.py assets/covers          # 全目录体检
> ```
>
> **2026-10-16 全站清除 4:2:0。** 体检发现 `ui-qipai` 只是冰山一角：另有 **10 张封面**
> （`char-royal` `kv-casino` `kv-dynasty` `logo-mockup` `logo-sheets` `logo-showcase`
> `popup-lobby` `popup-win` `popup-zeus` `ui-cardspec`）以及 `assets/works/` **全量
> 168 张主图 + 85 张缩略图**都还是 4:2:0。分三条路修完，最终全站 0 个 4:2:0：
>
> | 对象 | 修法 |
> |---|---|
> | 主图 + 缩略图（168+85） | 直接重跑 `build_works.py`（`SUB=0` 已进管线），76MB → 132MB |
> | `ui-qipai` `kv-dynasty` `ui-cardspec` `logo-sheets` `logo-mockup` `popup-zeus` `popup-win` | `requant_covers.py` — NCC 定位到源图，取原生像素块 |
> | `kv-casino` `popup-lobby` | 重跑 `make_extra_covers.py`（它们本就是「图集图居中裁 3:2」） |
> | `char-royal` | 重跑 `make_char_cover.py`（纯合成，改 `subsampling=0` 即可） |
>
> 两个排查要点，都是这次绕了弯路才确认的：
>
> - **大图上的 NCC 会失灵**。`kv-casino` 的源图是 10100×6349 的 AI 促销图，上面排着
>   12 个结构雷同的 banner，定位时缩到 560 宽只剩一团糊，最高分才 0.695。最后是拿
>   「它的生成脚本 `make_extra_covers.py`」反推出的构图，重构后自检 NCC **0.9998**。
>   **源图越大越相似，越不要指望 NCC，先去找生成脚本。**
> - **别用「整图 NCC」找 12 宫格封面的来源**。`logo-showcase` 的封面是「12 个大 LOGO」，
>   母版是「60+ 个小 LOGO」，两者是同一批 LOGO 的不同排版 —— 整图定位 0.227，逐格定位
>   也只有 0.48~0.81 且出现重复乱配。**它是全站唯一一张无法从源头重建的封面**
>   （源素材已不在 `F:/作品整理`），保留 4:2:0。影响很小：它在卡片里是从 1200 缩到
>   607 显示，色度平面 600px ≈ 显示宽度，缩放下看不出差别；且灯箱展示的是图集主图
>   （`logo-showcase-1.jpg` 母版，4:4:4），不是它。
>
> `assets/art/` 里另有 5 张 4:2:0，都不属于作品图集：`portrait.jpg`（900×900，页面里
> `max-width:340px` 缩小显示）、`portrait-blur.jpg`（48×48 占位）、`hero-ocean/sky/space.jpg`
> **三张未被任何页面引用**（`grep -rn "hero-ocean" .` 为空，是早期模板遗留，建议删除）。
>
> **关键前提：对已经是 4:2:0 的文件再存一次 4:4:4 是没用的** —— 色度平面在当初编码时
> 就已被砍掉一半分辨率，重存只是把丢失的信息复制两份，PSNR 一个字节都不会涨。
> 必须回到源图（或合成脚本）重新生成。

`app.js` 的 `COVERS` 与 `build_works.py` 的 `covers` 是**两份独立映射**，
增删作品时两边都要改（构建脚本只重建 `WORKS`，不会重建 `COVERS`）。

### 3. 长图不要切成窄竖条

灯箱对 `nh/nw >= 1.25` 的竖长图走「按宽铺满 + 上下滚动」。如果一张图被切成
若干**窄竖条**（例如 384px 宽），每条都会被拉到灯箱舞台宽（约 1120px）——
即 3 倍放大的糊图。

`logo-showcase` 原本就是被切成 5 条 384×1920 的竖条（实测 5 条拼接后接缝像素差为 0，
来自同一张 1920×1920 海报），已还原为整图放进 `assets/works-src/logo-showcase/`。
**新增长图素材前请先确认：要么给足宽度（≥1200px），要么整体作为一张图展示。**

### 4. 发前自检（工作区根目录的两个脚本）

```bash
python _mkcheck.py        # 生成 game-art-portfolio/_check.html
python _shot.py scroll "#gallery"          # 生成 _shot.html（滚到作品区）
python _shot.py lightbox logo-showcase     # 生成 _shot.html（打开某作品灯箱）

chrome --headless=new --disable-gpu --window-size=1600,1000 \
  --virtual-time-budget=120000 --dump-dom "http://127.0.0.1:8811/_check.html"
```

`_check.html` 会断言：42 张卡片 / 86 张图集 / 默认 vegas 主题 / 封面全部可达且不窄于
640px / 3 条视频 ≥1920 宽 / 灯箱主图 ≥1000 宽且走 thumbs 小图 / **两个作品不共用同一张图**。
跑完记得删掉 `_check.html`、`_check-app.js`、`_shot.html`（它们会跟站点一起被发布）。

### 5. 文案

- **`index.html`**：姓名、Hero 标语、能力描述、经历时间线、邮箱与社交链接。
- **`app.js`** 顶部 `WORKS` 数组：每件作品在灯箱里展示的标题、英文副标、项目说明、年份、职责、工具（由构建脚本生成，改文案请改 `build_works.py` 里的 `META`）。
- 关于区的在岗状态在 `index.html` 的 `.about__facts` 里。

### 6. 增删作品

在 `tools/build_works.py` 里对应的分组表（`ui_single` / `kv_groups` / `popup_groups` …）
增删一条，同步改 `ORDER`、`covers` 与 `app.js` 的 `COVERS`，再跑一次构建脚本即可。

## 响应式断点

- ≥1080px：4 列画廊 / 3 列能力卡 / 6 步管线
- 861–1080px：3 列画廊 / 2 列能力卡 / 3 列管线
- 641–860px：2 列画廊，汉堡全屏菜单
- ≤640px：1 列画廊，管线 2 列；≤400px 管线单列
- 支持触屏滑动翻页灯箱、键盘 ←/→/Esc、`prefers-reduced-motion` 降级

## 重新生成占位图（可选）

```bash
python tools/gen_art.py
```

可改 `tools/gen_art.py` 里的配色（`P` 字典）与构图参数后重新生成。
