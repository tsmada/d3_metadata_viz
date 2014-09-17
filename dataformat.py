from xlrd import open_workbook, cellname
from xlwt import easyxf
from xlutils.copy import copy
from xlwt import Workbook,easyxf,Formula
import datetime
import time
import os,sys

wbstr = 'input.xlsx'
wb = open_workbook(wbstr)
g = wb.sheet_by_index(0)
keys = []
maps = {}
values = []
applist = []

def stripthis(value):
    value = str(value).replace("[","").replace("]","").replace(".","").replace("'","")
    return value

def buildapplist():
    for rows in range(2, g.nrows):
        for cols in range(1, 8):
            try:
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
        if appfromfqan not in applist:
            applist.append(appfromfqan)
        elif apptofqan not in applist:
            applist.append(apptofqan)

buildapplist()
current = ""
with open("output.json", "wb") as f:
    f.write("[\n")
    k=0
    for apps in applist:
        print apps
        i=0
        current = '{"name": "system.app.' + apps + '", "size": 17010, "imports":[]},\n'
        for rows in range(2, 674):
                for cols in range(3, 4):
                    if str(g.cell(rows,4).value) == apps:
                        print "Dupe App: " + str(apps) + " | Imports: " + str(g.cell(rows, 3).value)
                        if i == 0:
                            current = '{"name": "system.app.' + apps + '", "size": 17010, "imports":['
                        current += '"system.app.' + str(g.cell(rows,3).value) + '",'
                        i+=1
                        print i
                    # else:
                    #     if stripthis(str(g.cell(rows,cols).value)) != apps:
                    #         current = '{"name": "system.app.' + apps + '", "size": 17010, "imports":[]}'
                    #     else:
                    #         current = '{"name": "system.app.' + apps + '", "size": 17010, "imports":["'

        print current
        f.write(current)
        current = ""
        k+=1
print "Distinct Destination Apps: ", len(applist)




