# 验证记录 · app-a 闯关地图版（huashu-demo/math-error-quest/design-demos/app-a）

日期：2026-11-26。工具：visual-hierarchy skill 的 scripts/squint.py（高斯模糊半径 = 图宽 2% + 显著区域连通域计量）+ 人工对照检查表。

## 原稿（before）
- 截图：`~/workspace/huashu-demo/math-error-quest/design-demos/app-a.png`（840×1760）
- 模糊图：`app-a-before/app-a_blur.png` / `_blur_gray.png` / `_thumb.png`
- 计量：salient_regions=8，hero_share=0.694，competing_foci=1，focus_rows=[2]（仅底部三分之一），verdict=WEAK-cta-only-focus
- 人工诊断（对着模糊图说）：
  1. 模糊后唯一的大色块是底部红色 CTA 条——眼睛先被一个「按钮」抓住，却不知道这页是干嘛的：CTA 有声量、页面无主题。
  2. 中部散落 5 个等大圆点（关卡节点）+ 右侧橙色怪兽头 + 节点 3 橙球，三个饱和色（绿/橙/红）在不同位置互相稀释，没有一个是语义锚点（狮子头像只有指甲盖大）。
  3. 主行动重复出现两次：第 3 关节点自带「开始闯关」+ 底部大 CTA，两个主按钮互相竞争。
  4. 顶部星星/钻石白胶囊与标题同亮度，第一落点不明确。

## 改法（按诊断逐条对症，未动内容与文案骨架）
1. 顶部信息条整体降级：去掉白胶囊，资源数改小号灰字。
2. 新建唯一主角：深色英雄卡（上部三分之一）兜住狮子大头像（92px 圆形语义锚点）+「当前关卡·第3关 / 跨零退位怪兽 503−278」大字 + 全页唯一主按钮「开始闯关」（红，卡内）。
3. 删除底部巨型红色 CTA 条（与节点 CTA 的重复主行动）。
4. 关卡路径降为次级分组：收进一张白卡横排，节点统一弱化（已过=浅绿、未到=浅灰），当前关只用红描边+「当前关」标签标记，不再用饱和橙色大球；橙色怪兽头删除（其语义已由英雄卡狮子承担）。
5. 单元进度改一条细带 + 一行文字，不再用大白卡；家长小结沿用虚线弱卡；底部导航全灰、仅当前项着色。

改版文件：`app-a-revised.html` / `app-a-revised.png`（420×880，chrome-headless-shell 渲染）

## 改版（after）
- 模糊图：`app-a-after/app-a-revised_blur.png`
- 计量：salient_regions=2，hero_share=0.686，competing_foci=2，focus_rows=[0,1]（上+中），verdict=PASS
- 人工复核（对着模糊图说）：一个深色大块占据上部，里面有圆形头像锚点和一条红色横带（主按钮），下方只有一排淡淡的圆点和一条虚线卡——即使字全糊，也能读出「上面是主任务卡、下面是进度路线」的结构；第一落点（英雄卡）同时携带主题与行动，不再是孤零零的底部按钮。

## 结论
「糊成一片也能看出这页干嘛」在结构层成立：before 的显著焦点只在底部（CTA-only），after 的焦点回到上部英雄区且主按钮被收进英雄卡内。对照拼图：`before-after-sheet.png`（原稿 | 原稿模糊 | 改版 | 改版模糊）。

注：计量只是提示（verdict_hint），最终判定来自人工对照检查表——app-b 的计量同样 PASS 且人工复核也确实达标（深色英雄卡在上、列表整齐在下），app-c 计量 WEAK-cta-only 与人工判断一致（底部红条独大、两张题卡在米色底上显著度不足）。
