import { button, data, dialog, error, footer, placeHolder, sidebar, table, tooltip, viewTitle } from './modules'

export default {
    yearPattern: {label:'年份图案',placeholder:'输入四位年份，例如 2030',apply:'添加并应用年份',help:'可自由添加 1000–9999 年。应用后生成首页卡片图案，不会修改名单、奖项或中奖记录。',invalid:'请输入 1000–9999 之间的四位年份。',columns:'年份图案至少需要 {count} 列，请先调整列数。',current:'当前图案',custom:'自定义或旧版图案',saved:'已保存年份',remove:'删除年份 {year}'},
    button: button.zhCn,
    sidebar: sidebar.zhCn,
    viewTitle: viewTitle.zhCn,
    table: table.zhCn,
    dialog: dialog.zhCn,
    tooltip: tooltip.zhCn,
    error: error.zhCn,
    placeHolder: placeHolder.zhCn,
    data: data.zhCn,
    footer: footer.zhCn,
}
