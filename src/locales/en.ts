import { button, data, dialog, error, footer, placeHolder, sidebar, table, tooltip, viewTitle } from './modules'

export default {
    yearPattern: {label:'Year pattern',placeholder:'Enter a four-digit year, e.g. 2030',apply:'Add and apply year',help:'Add any year from 1000 to 9999. This changes only the card pattern, preserving participants, prizes and winners.',invalid:'Enter a four-digit year between 1000 and 9999.',columns:'The year pattern needs at least {count} columns. Adjust the column count first.',current:'Current pattern',custom:'Custom or legacy pattern',saved:'Saved years',remove:'Remove year {year}'},
    button: button.en,
    sidebar: sidebar.en,
    viewTitle: viewTitle.en,
    table: table.en,
    dialog: dialog.en,
    tooltip: tooltip.en,
    error: error.en,
    placeHolder: placeHolder.en,
    data: data.en,
    footer: footer.en,
}
