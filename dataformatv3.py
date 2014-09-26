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
appidlist = []
maps = {}
applist = []

def stripthis(value): ## function to strip bs
    value = str(value).replace("[","").replace("]","").replace(".","").replace("'","").replace(".CSV","CSV").replace("*",'')
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
        if appfromfqan not in applist:
            applist.append(appfromfqan)
            appidlist.append(stripthis(str(appfromid)))
            maps[rows] = {"riskdomain": riskdomain, "appfromid": appfromid, "appfromfqan": appfromfqan, "apptofqan": apptofqan, "apptoid": apptoid, "functions": functions, "types": types}
        elif apptofqan not in applist:
            applist.append(apptofqan)
            appidlist.append(stripthis(str(apptoid)))
            maps[rows] = {"riskdomain": riskdomain, "appfromid": appfromid, "appfromfqan": appfromfqan, "apptofqan": apptofqan, "apptoid": apptoid, "functions": functions, "types": types}

buildapplist()
current = ""

with open("outputv3.json", "wb") as f: ##open output file for writing
    f.write("[\n") ## write json syntax header
    k=0 ## app counter
    for apps in applist: ## iterate through the applications found with initial parsing -- there should only be one row per unique app
        print apps
        rowset = []
        i=0
        current = '{"appid": "' + str(appidlist[k]) + '","name": "system.app.' + apps + '", "size": 17010, "imports":[]},\n' ## build 0 dependancy row
        for rows in range(2, 874): ##674
                for cols in range(3, 4):
                    if str(g.cell(rows,4).value) == apps: ## if we found a match to import on a current row
                        if str(g.cell(rows-1,3).value) == str(g.cell(rows, 3).value): ## if this is a duplicated import then we must BREAK
                            break
                        if i == 0: ## also if this is the first iteration after finding an import to add, we must clear the original syntax and rebuild
                            current = '{"appid": "' + str(g.cell(rows, 2).value) +'", "name": "system.app.'+ apps + '", "size": 17010,"imports":['
                        current += '"system.app.' + stripthis(str(g.cell(rows,3).value)) + '",' ## chain import statements to the end of the row
                        ##current.replace("TEST", '"'+ str(g.cell(rows, 2).value)+ '"');
                        i+=1
                        rowset.append(rows)
        k+=1
        ##current.replace("TEST", maps[rows]["appfromid"]);
        if current[-3] != "}": ## weird hacky thing to check if line is terminated correctly
            s = list(current)
            s[-1] = ''
            s.append('],"rows": ' + str(rowset) + '},\n')
            current = "".join(s)
        print "k: ", k
        if k == len(applist): ## if this is the very last app, then we do not need a comma, we need to terminate the row
            s = list(current)
            s[-2] = ""
            current = "".join(s)
        f.write(current)
        current = ""
        if k == len(applist):
            f.write("\n]") ## terminate the data model syntax
    ##f.write('[{"rows": ' + str(rowset) + '}]')
print "Distinct Apps: ", len(applist)
