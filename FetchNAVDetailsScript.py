###########################################################
# Simple Script to fetch NAV Details and push to Salesforce
# Author: Abhishek Dey
# Version: 1.0
# Date: 03-Apr-2018
###########################################################

from simple_salesforce import Salesforce

mutual_fund_NAVDict = {}
with open("NAVAll.txt") as f:
    for line in f:
        if "Axis Long Term Equity Fund - Growth" in line:
             mutual_fund_NAVDict['Axis Long Term Equity Fund'] = line.split(';')[4]
        if "Aditya Birla Sun Life Tax Relief '96 - Growth Option" in line:
             mutual_fund_NAVDict["Aditya Birla Sun Life Tax Relief '96 - Growth"] = line.split(';')[4]

print mutual_fund_NAVDict

sf = Salesforce(username='XXX', password='YYY', security_token='ZZZ')
for fund in mutual_fund_NAVDict.keys():
    sf.Mutual_Fund__c.create({'Type__c':'ELSS','NAV__c': mutual_fund_NAVDict.get(fund),
                          'Portfolio_Name__c':fund})

