import xlrd
book = xlrd.open_workbook('testable_issues.xls')
sheet = book.sheet_by_index(0)
headers = [sheet.cell_value(0, col_idx) for col_idx in range(sheet.ncols)]

# Find APK URL column index
apk_url_idx = headers.index('APK_URL')
issue_title_idx = headers.index('Issue Title')

print('='*60)
print('APK FILES FROM EXCEL SHEET (testable_issues.xls):')
print('='*60)
apk_set = set()
for row_idx in range(1, sheet.nrows):
    apk_url = sheet.cell_value(row_idx, apk_url_idx)
    issue_title = sheet.cell_value(row_idx, issue_title_idx)
    if apk_url and isinstance(apk_url, str):
        apk_name = apk_url.split('/')[-1]
        if apk_name not in apk_set:
            apk_set.add(apk_name)
            print(apk_name)

print()
print('Total unique APK files: ' + str(len(apk_set)))

