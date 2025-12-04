export interface FormField {
    id: string
    type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'optionlist' | 'button' | 'signature' | 'date' | 'image'
    x: number
    y: number
    width: number
    height: number
    name: string
    defaultValue: string
    fontSize: number
    alignment: 'left' | 'center' | 'right'
    textColor: string
    required: boolean
    readOnly: boolean
    tooltip: string
    combCells: number
    maxLength: number
    options?: string[]
    checked?: boolean
    exportValue?: string
    groupName?: string
    label?: string
    pageIndex: number
    action?: 'none' | 'reset' | 'print' | 'url' | 'js' | 'showHide'
    actionUrl?: string
    jsScript?: string
    targetFieldName?: string
    visibilityAction?: 'show' | 'hide' | 'toggle'
    dateFormat?: string
    multiline?: boolean
    borderColor?: string
    hideBorder?: boolean
}

export interface PageData {
    index: number
    width: number
    height: number
    pdfPageData?: string
}
