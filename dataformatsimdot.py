from xlrd import open_workbook, cellname
from xlwt import easyxf
from xlutils.copy import copy
from xlwt import Workbook,easyxf,Formula
import datetime
import time
import os,sys

inputsource = raw_input("Input Spreadsheet: ") ## Ask user for input source
wbstr = inputsource ## Set input source to variable
wb = open_workbook(wbstr) ## Set variable = instantiation of open_workbook(input source)
g = wb.sheet_by_index(0) ## Grab the first sheet
keys = []
applist = []
maps = []

def stripthis(value): ## function to strip bs
    value = str(value).replace("[","").replace("]","").replace(".","").replace("'","").replace(".CSV","CSV")
    return value

def buildapplist(): ## sheet parser
    for rows in range(2, g.nrows): ## iterate through the rows, start at index 2 (0,1,2), as there are headers in 0-1
        for cols in range(1, 8): ## right now we are only interested in the data in columns 1-8 or B-H
            try: ## set variables = to current cell value
                if cols == 1:
                    riskdomain = stripthis(str(g.cell(rows,cols).value))
                if cols == 2:
                    appfromid = stripthis(str(g.cell(rows,cols).value))
                if cols == 3:
                    appfromfqan = stripthis(str(g.cell(rows,cols).value))
                if cols == 4:
                    apptofqan = stripthis(str(g.cell(rows,cols).value))
                if cols == 5:
                    apptoid = stripthis(str(g.cell(rows,cols).value))
                if cols == 6:
                    functions = stripthis(str(g.cell(rows,cols).value))
                if cols == 7:
                    types = stripthis(str(g.cell(rows,cols).value))
            except:
                pass

        ## this one weird trick that programmers hate!!!!!
        maps.append({'riskdomain': riskdomain, 'appfromid': appfromid, 'appfromfqan': appfromfqan, 'apptofqan': apptofqan, 'apptoid': apptoid, 'functions': functions, 'types': types})

buildapplist()
mapps = []
for mapp in maps:
    mapp = str(mapp).replace("'", '"')
    mapps.append(mapp)


with open("outputtest.json", "wb") as f:
    f.write(str(mapps).replace("'",""))

