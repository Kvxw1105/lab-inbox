# 视觉层级咒语做厚实验（2026-11-26）

## 来历
源于一条短视频的说法：判断 UI 好不好用就「眯起眼睛看，糊成一片还认不出这页干嘛就重改」，且给 AI 发一句「优化 UI 视觉层级」就几乎万能。主人立场：一句话不可能让前端设计一下子变好，要把这个思维做厚成我们自己的提示词/skill，并与已装的 huashu-design、jakubkrehel 的 better-ui 系列配合。流程：四家模型会诊（GPT/Gemini/Claude/Grok，同题独立、自选立场）→ Muse 收敛（非拼贴）→ 实测验证 → 开源至此。

## 会诊结论（全文见 consult/SYNTHESIS.md）
- 共识：咒语是高压缩的语义指针——激活训练语料里与「视觉层级」强共现的设计共识并展开隐式清单，产生跨属性联动；它不做任何视觉测量。演示显得灵，部分因为输入恰是它最舒服的场景（结构已对、只是样式平坦的现成页面），且视频的点击率证据无对照组。
- 失效边界：信息无主次/IA 错位、业务语义与通用共识倒挂、从零生成、高密度数据界面、硬约束封死、无视觉反馈闭环；以及 GPT 的一条——层级对了仍可廉价，感知秩序 ≠ 视觉品质。
- Grok 缺席：简报送达后其账号撞 usage limit，未产出回答，未用他家顶替。GPT 另按主人指示复述了它记得的主人审美偏好，单独存 consult/GPT_MEMORY.md（主人资产）。

## 产出
- `skill/`：visual-hierarchy skill 本体（SKILL.md + scripts/squint.py 程序化眯眼测试 + references/diagnosis-tags.md 诊断标签与反例库 + prompts/hierarchy-officer.md「视觉层级核对官」角色提示词，角色共创型，1623 字）。
- 结构：入口分流 → 主次表（复杂页展开 Tier 1–4 配额）→ 眯眼验收（模糊+显著焦点计量+人工六条+盲评关卡+两条硬规则，回环 ≤2 轮）→ 按序改（删→并→降→升→分）+ 反模式熔断 + 决策记录 → 失效声明。
- 配合：huashu-design 打磨环收尾调用本验收作「层级验收门」；数值精确值归 better-typography/layout/ui/colors，本 skill 只定主次与验收，不重造数值。

## 验证结论（verify/）
样本：huashu-demo 的 app-a 闯关地图版（主人评「规范但廉价」那批方向稿之一）。
- Before：模糊后唯一显著块只在底部（巨型 CTA），metrics verdict=WEAK-cta-only-focus（focus_rows=[2]，competing_foci=1）；人工同判：按钮很响、主题无声、主行动重复两次。
- 改法：主行动并进顶部深色英雄卡（大头像锚点+大字+唯一主按钮）、删底部巨型 CTA、路径节点成组降级、顶部资源条去胶囊降级。
- After：metrics verdict=PASS（focus_rows=[0,1]，competing_foci=2，hero_share=0.686）；模糊后能读出「上部主任务卡 + 下部进度路线」的结构，「糊成一片也能看出这页干嘛」在结构层成立。
- 注：push 通道只支持文本文件，前后对照截图（PNG）未入仓，保存在产出方本地工作区；改版页 verify/app-a-revised.html 可自行渲染复现，metrics 前后 JSON 已入仓。
