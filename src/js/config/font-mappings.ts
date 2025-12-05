/**
 * Font mappings for OCR text layer rendering
 * Maps Tesseract language codes to appropriate Noto Sans font families and their CDN URLs
 */

export const languageToFontFamily: Record<string, string> = {
    // CJK Languages
    jpn: 'Noto Sans JP',
    chi_sim: 'Noto Sans SC',
    chi_tra: 'Noto Sans TC',
    kor: 'Noto Sans KR',

    // Arabic Script
    ara: 'Noto Sans Arabic',
    fas: 'Noto Sans Arabic',
    urd: 'Noto Sans Arabic',
    pus: 'Noto Sans Arabic',
    kur: 'Noto Sans Arabic',

    // Devanagari Script  
    hin: 'Noto Sans Devanagari',
    mar: 'Noto Sans Devanagari',
    san: 'Noto Sans Devanagari',
    nep: 'Noto Sans Devanagari',

    // Bengali Script
    ben: 'Noto Sans Bengali',
    asm: 'Noto Sans Bengali',

    // Tamil Script
    tam: 'Noto Sans Tamil',

    // Telugu Script
    tel: 'Noto Sans Telugu',

    // Kannada Script
    kan: 'Noto Sans Kannada',

    // Malayalam Script
    mal: 'Noto Sans Malayalam',

    // Gujarati Script
    guj: 'Noto Sans Gujarati',

    // Gurmukhi Script (Punjabi)
    pan: 'Noto Sans Gurmukhi',

    // Oriya Script
    ori: 'Noto Sans Oriya',

    // Sinhala Script
    sin: 'Noto Sans Sinhala',

    // Thai Script
    tha: 'Noto Sans Thai',

    // Lao Script
    lao: 'Noto Sans Lao',

    // Khmer Script
    khm: 'Noto Sans Khmer',

    // Myanmar Script
    mya: 'Noto Sans Myanmar',

    // Tibetan Script
    bod: 'Noto Serif Tibetan',

    // Georgian Script
    kat: 'Noto Sans Georgian',
    kat_old: 'Noto Sans Georgian',

    // Armenian Script
    hye: 'Noto Sans Armenian',

    // Hebrew Script
    heb: 'Noto Sans Hebrew',
    yid: 'Noto Sans Hebrew',

    // Ethiopic Script
    amh: 'Noto Sans Ethiopic',
    tir: 'Noto Sans Ethiopic',

    // Cherokee Script
    chr: 'Noto Sans Cherokee',

    // Syriac Script
    syr: 'Noto Sans Syriac',

    // Cyrillic Script (Noto Sans includes Cyrillic)
    bel: 'Noto Sans',
    bul: 'Noto Sans',
    mkd: 'Noto Sans',
    rus: 'Noto Sans',
    srp: 'Noto Sans',
    srp_latn: 'Noto Sans',
    ukr: 'Noto Sans',
    kaz: 'Noto Sans',
    kir: 'Noto Sans',
    tgk: 'Noto Sans',
    uzb: 'Noto Sans',
    uzb_cyrl: 'Noto Sans',
    aze_cyrl: 'Noto Sans',

    // Latin Script (covered by base Noto Sans)
    afr: 'Noto Sans',
    aze: 'Noto Sans',
    bos: 'Noto Sans',
    cat: 'Noto Sans',
    ceb: 'Noto Sans',
    ces: 'Noto Sans',
    cym: 'Noto Sans',
    dan: 'Noto Sans',
    deu: 'Noto Sans',
    ell: 'Noto Sans',
    eng: 'Noto Sans',
    enm: 'Noto Sans',
    epo: 'Noto Sans',
    est: 'Noto Sans',
    eus: 'Noto Sans',
    fin: 'Noto Sans',
    fra: 'Noto Sans',
    frk: 'Noto Sans',
    frm: 'Noto Sans',
    gle: 'Noto Sans',
    glg: 'Noto Sans',
    grc: 'Noto Sans',
    hat: 'Noto Sans',
    hrv: 'Noto Sans',
    hun: 'Noto Sans',
    iku: 'Noto Sans',
    ind: 'Noto Sans',
    isl: 'Noto Sans',
    ita: 'Noto Sans',
    ita_old: 'Noto Sans',
    jav: 'Noto Sans',
    lat: 'Noto Sans',
    lav: 'Noto Sans',
    lit: 'Noto Sans',
    mlt: 'Noto Sans',
    msa: 'Noto Sans',
    nld: 'Noto Sans',
    nor: 'Noto Sans',
    pol: 'Noto Sans',
    por: 'Noto Sans',
    ron: 'Noto Sans',
    slk: 'Noto Sans',
    slv: 'Noto Sans',
    spa: 'Noto Sans',
    spa_old: 'Noto Sans',
    sqi: 'Noto Sans',
    swa: 'Noto Sans',
    swe: 'Noto Sans',
    tgl: 'Noto Sans',
    tur: 'Noto Sans',
    vie: 'Noto Sans',
    dzo: 'Noto Sans',
    uig: 'Noto Sans',
};

export const fontFamilyToUrl: Record<string, string> = {
    'Noto Sans JP': 'https://raw.githack.com/googlefonts/noto-cjk/main/Sans/OTF/Japanese/NotoSansCJKjp-Regular.otf',
    'Noto Sans SC': 'https://raw.githack.com/googlefonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf',
    'Noto Sans TC': 'https://raw.githack.com/googlefonts/noto-cjk/main/Sans/OTF/TraditionalChinese/NotoSansCJKtc-Regular.otf',
    'Noto Sans KR': 'https://raw.githack.com/googlefonts/noto-cjk/main/Sans/OTF/Korean/NotoSansCJKkr-Regular.otf',
    'Noto Sans Arabic': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansArabic/NotoSansArabic-Regular.ttf',
    'Noto Sans Devanagari': 'https://raw.githack.com/googlefonts/noto-fonts/main/unhinted/ttf/NotoSansDevanagari/NotoSansDevanagari-Regular.ttf',
    'Noto Sans Bengali': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansBengali/NotoSansBengali-Regular.ttf',
    'Noto Sans Gujarati': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansGujarati/NotoSansGujarati-Regular.ttf',
    'Noto Sans Kannada': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansKannada/NotoSansKannada-Regular.ttf',
    'Noto Sans Malayalam': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansMalayalam/NotoSansMalayalam-Regular.ttf',
    'Noto Sans Oriya': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansOriya/NotoSansOriya-Regular.ttf',
    'Noto Sans Gurmukhi': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansGurmukhi/NotoSansGurmukhi-Regular.ttf',
    'Noto Sans Tamil': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansTamil/NotoSansTamil-Regular.ttf',
    'Noto Sans Telugu': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansTelugu/NotoSansTelugu-Regular.ttf',
    'Noto Sans Sinhala': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansSinhala/NotoSansSinhala-Regular.ttf',
    'Noto Sans Thai': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansThai/NotoSansThai-Regular.ttf',
    'Noto Sans Khmer': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansKhmer/NotoSansKhmer-Regular.ttf',
    'Noto Sans Lao': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansLao/NotoSansLao-Regular.ttf',
    'Noto Sans Myanmar': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansMyanmar/NotoSansMyanmar-Regular.ttf',
    'Noto Sans Hebrew': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansHebrew/NotoSansHebrew-Regular.ttf',
    'Noto Sans Georgian': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansGeorgian/NotoSansGeorgian-Regular.ttf',
    'Noto Sans Ethiopic': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansEthiopic/NotoSansEthiopic-Regular.ttf',
    'Noto Serif Tibetan': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSerifTibetan/NotoSerifTibetan-Regular.ttf',
    'Noto Sans Cherokee': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansCherokee/NotoSansCherokee-Regular.ttf',
    'Noto Sans Armenian': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansArmenian/NotoSansArmenian-Regular.ttf',
    'Noto Sans Syriac': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSansSyriac/NotoSansSyriac-Regular.ttf',
    'Noto Sans': 'https://raw.githack.com/googlefonts/noto-fonts/main/hinted/ttf/NotoSans/NotoSans-Regular.ttf',
};